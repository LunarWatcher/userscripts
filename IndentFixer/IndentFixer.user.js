// ==UserScript==
// @name         Indentation fixer
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      0.0.0.2
// @description  A userscript that theoretically should fix formatting.
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/IndentFixer/IndentFixer.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/IndentFixer/IndentFixer.user.js
// ==/UserScript==


const TAG_CLASS = ".s-tag.rendered-element";
const EDITOR_CLASS = ".wmd-input";
const BUTTON_ID = "clean_indents";

const baseIndent = "    ";
const listIndent = "        ";

(function() {
    'use strict';
    try {
        StackExchange.using('inlineEditing', function() {
            StackExchange.ready(function() {
                var test = window.location.href.match(/.posts.(\d+).edit/);
                if(test) {
                    init($('form[action^="/posts/' + test[1] + '"]'), test[1]);
                }
                $('#post-form').each(function(){
                    let currForm = $(this);
                    console.log(currForm);
                    init(currForm, currForm[0][0].getAttribute("value"));
                });
            });
        });
        $(document).ajaxComplete(function() {
            var test = arguments[2].url.match(/posts.(\d+).edit-inline/);
            if(!test) {
                test = arguments[2].url.match(/review.inline-edit-post/);
                if(!test) return;
                test = arguments[2].data.match(/id=(\d+)/);
                if(!test) return;
            }
            StackExchange.ready(function() {
                init($('form[action^="/posts/' + test[1] + '"]'), test[1]);
            });
        });
    }catch(e) {
        console.log("Failed to launch the script");
        console.log(e);
    }
})();

function init(editorRoot, id){
    console.log("Initializing editor.");
    console.log(id);
    const button = createButton(id);
    $(button).appendTo(editorRoot);
    $("#" + BUTTON_ID + "_" + id).click(fixIndents);

}

function fixIndents() {
    console.log("Clicked");
    let button = $(this);
    if(button == null) {
        console.log("Null button?!");
    }

    let id = button.attr("id");
    let postId = id.match(/_(\d+)/)[1];
    if(postId == null) {
        console.log("Couldn't find the post ID from the button ID. Dumping button");
        console.log(button);
        return;
    }

    let inputField = $("#wmd-input-" + postId)[0];
    if(inputField == null) {
        console.log("Couldn't grab the input field!");
        return;
    }

    let text = inputField.defaultValue;

    // Now this is where stuff gets interesting.
    // First: let's get the lines.
    let lines = text.split("\n");

    // Now it gets complicated (:
    // Define the token queue
    let queue = [];
    // Define the output String
    let reconstructed = "";
    // Keep track of the current states:
    let codeBlock = false;
    let list = false;
    let comment = false;
    let spaced = false;
    let hadNewline = false;
    let quote = false;
    // Iterate the lines
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // This checking is somewhat complicated :/

        // First: Do we have breaking format and a list?
        if((!comment && line.startsWith("---")) || line.startsWith("<!--")) {
            // Both of these break lists.
            if(list) list = false;
        }
        if(!codeBlock && line.startsWith("<!--") && !line.contains("-->")) comment = true;
        if(comment && !line.contains("-->")) {
            reconstructed += line + "\n";
            continue;
        }else if(comment) {
            comment = false;
            reconstructed += line + "\n";
            continue;
        }
        if(line == "") hadNewline = true;
        if(!quote)
            quote = line.startsWith(">");
        else if(quote && hadNewline && !line == "") {
            quote = false;
            hadNewline = false;
        }
        if(list && !codeBlock && !line.startsWith("    ") && hadNewline && !line == "") {
            list = false;
            hadNewline = false;
        }
        // Now we check four spaces
        if(line.startsWith("    ")) {
            // If we're in a list
            if(list) {
                if(line.startsWith("        " /*8 spaces*/)) {
                    // 8 spaces == code
                    codeBlock = true;
                    spaced = true;
                } else if(line.startsWith("    ```")) {
                    // But four spaces followed by backticks is also a nested code block
                    codeBlock = true;
                    spaced = false;
                } else continue; // In any other case, this isn't a code block. And we cannot possibly expect a simple script to identify code vs not code
            }else {
                // If we're not in a list, this is a code block.
                codeBlock = true;
            }
        } else if(line.startsWith("```")) {
            // no indent GH-style formatting breaks list formatting
            if(list) list = false;
            if(codeBlock) {
                codeBlock = false;
                queue = [];
            }
            else {
                codeBlock = true;
                spaced = false;
            }
            reconstructed += line + "\n";
            continue;
            // If the block is spaced, we're currently in a block, and the line doesn't start with four spaces, the indent has come to an end.
        } else if(spaced && codeBlock && !line.startsWith("    ")) {
            codeBlock = false;
            queue = [];
            // However, some people forget to indent stuff :/
            // So if we can find a lonely char, let's ~~bring it back into the heat~~ fix the indents.
            if(line.match(/^[\[\]\{\}()]/)){
                reconstructed += getIndents(list, 1, getBaseIndent(spaced)) + line  + "\n";
            } else if(/<\/?.*>/) { // Yep, matching HTML with regex. Fite me. This could theoretically mismatch <br> right after the block.
                reconstructed += getIndents(list, 1, getBaseIndent(spaced)) + line  + "\n";
            }
        }
        if(codeBlock) {
            for(let j = 0; j < line.length; j++) {
                let char = line[j];
                let flipped = flip(char);
                if(flipped != null) {
                    if(queue.length == 0) {
                        queue.push(char);
                    } else {
                        let last = queue[queue.length - 1];
                        if(last == flipped) queue.pop();
                        else queue.push(char);
                    }
                }
            }
            let trimmedLine = line.trim();
            let level = queue.length + 1;
            reconstructed += getIndents(list, level, getBaseIndent(spaced)) + trimmedLine + "\n";
        } else reconstructed += line  + "\n";
    }

    console.log(reconstructed);

}

function getBaseIndent(spaced) {
    if(!spaced) return ""; else return "    ";
}

function getIndents(isList, level, baseIndent) {
    let base;
    if(isList) base = baseIndent + baseIndent; else base = baseIndent;
    if(level == 1) return base;
    else {
        for(let i = 0; i < level; i++) {
            base += baseIndent;
        }
        return base;
    }
}

function flip(char) {
    if(char == "{") return "}";
    if(char == "(") return ")";
    if(char == "[") return "]";
    if(char == "}") return "{";
    if(char == ")") return "(";
    if(char == "]") return "[";
    return null;
}

function createButton(id) {
    return "<a href=\"javascript:void(0);\" id='" + BUTTON_ID + "_" + id + "' class='grid--cell s-btn'>Clean up indentation</a>";
}
