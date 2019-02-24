// ==UserScript==
// @name         Indentation fixer
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      0.0.0.1
// @description  A userscript that theoretically should fix formatting.
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/IndentFixer/IndentFixer.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/IndentFixer/IndentFixer.user.js
// ==/UserScript==


const divClass = ".grid.gs8.gsx.pt12.pb16";
const TAG_CLASS = ".s-tag.rendered-element";
const EDITOR_CLASS = ".wmd-input";
const BUTTON_ID = "clean_indents";

(function() {
    'use strict';
    StackExchange.using('inlineEditing', function() {
        StackExchange.ready(function() {
            var test = window.location.href.match(/.posts.(\d+).edit/);
            if(test) {
                init($('form[action^="/posts/' + test[1] + '"]'), test[1]);
            }
            $('#post-form').each(function(){
                init($(this), $(this).attr("id").match(/-(\d+)/)[1]);
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
})();

function init(editorRoot, id){
    console.log("Initializing editor.");
    console.log(id);
    const button = createButton(id);
    $(button).appendTo(divClass);
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
    console.log(text);
    
    // TODO 
}

function createButton(id) {
    return "<a href=\"javascript:void(0);\" id='" + BUTTON_ID + "_" + id + "' class='grid--cell s-btn'>Clean up indentation</a>";
}


