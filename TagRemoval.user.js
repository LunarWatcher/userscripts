// ==UserScript==
// @name         Retagger
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.1.4
// @description  Easy tag burnination, removal, and retagging
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/TagRemoval.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/TagRemoval.meta.js
// ==/UserScript==

class ReplacementInfo{
    constructor(reason, additionalTag){
        this.reason = reason;
        this.additionalTag = additionalTag;
    }
}

const reasons = {
    "ide": "IDE tags should not be used for questions that aren't about the IDE itself",
    "genericBurnination": "Removed tag that's in the process of burnination; see meta",
    "python": "Questions on Python-specific versions should also be tagged with Python",
    "java": "Questions tagging with java-specific versions should also be tagged [java]",
    "version": "Questions tagging with specific versions should also be tagged with the base language/tool"
};

const tagTargets = {
    "code-review": reasons.genericBurnination,
    "design": "The design tag is being burninated. See meta: https://meta.stackoverflow.com/questions/320690/the-design-tag-is-being-burninated"
};

const removeTagsIfPresent = {
    "android-studio.*": new ReplacementInfo(reasons.ide, ["^android$", "java"]),
    "intellij-idea.*": new ReplacementInfo(reasons.ide, ["^android$", "java"])
}

// TODO more sensible naming
const cantBeAlone = {
    "^jquery": new ReplacementInfo("jQuery is a library, JS is the language", ["javascript"]),
    "^python-.*": new ReplacementInfo(reasons.python, ["python"]),
    "^java-.*": new ReplacementInfo(reasons.java, ["java"]),
    "^android-studio-.*": new ReplacementInfo(reasons.version, ["android-studio"]),
    "^excel-vba": new ReplacementInfo("Questions tagged excel-vba should also be tagged with excel and VBA where possible. See meta: https://meta.stackoverflow.com/questions/370095/merging-the-excel-vba-into-vba-speak-now-or-forever-hold-your-peace",
                                      ["excel", "vba"])
}

//Format: "tag name": ["tag replacement", "Replacement reason"]
const tagReplacements = {
    "^checkout$" : ["vcs-checkout", "Checkout is used for questions about finishing transactions, not the version control system feature \"checkout\""],
};

const divClass = ".grid.gs8.gsx.pt12.pb16";
const TAG_CLASS = ".s-tag.rendered-element";
const EDITOR_CLASS = ".wmd-input";
const BUTTON_ID = "burn";

const burn_button = "<a href=\"javascript:void(0);\" id='" + BUTTON_ID + "' class='grid--cell s-btn'>Burninate!</a>";
const DATA_KEY = "Retagger-";
const DEBUG = false;

(function() {
    'use strict';
    StackExchange.using('inlineEditing',function() {
        StackExchange.ready(function() {
            $('#post-form').each(function(){
                init();
            });
        });
    });
    $(document).ajaxComplete(function() {
        StackExchange.ready(function() {
            init();
        });
    });

})();

function init(){

    if($("#" + BUTTON_ID).length > 0){
        return;
    }
    if($("#question").length == 0){
        if($("#title").length == 0){
            if(DEBUG)
                console.log("Non-inline answer editor. Ignoring...");
            return;
        }

        $(burn_button).appendTo(divClass);
    }else{

        $(burn_button).appendTo('#question ' + divClass);

    }
    $("#burn").click(clearTags);

}

// Burnination methods

function clearTags(){
    var tags = $(TAG_CLASS)
    if(DEBUG){
        console.log("Tags to process:");
        console.log(tags);
    }
    var editDetails;

    if($("#question").length == 0){
        editDetails = $("#edit-comment");
    }else{
        editDetails = $("#question .edit-comment");
    }
    if(DEBUG)
        console.log(editDetails);
    if(editDetails === undefined)
        throw new Error();

    if(tags !== undefined){
        
        
        tags = addTags(tags, editDetails);
        tags = conditionalBurning(tags, editDetails);
        // Blatant tag removal is last, along with replaceTags.
        // this is to allow other removal types to override it.
        // An example of why this is like this: If there is a tag that should be removed, but 
        // but the replacement varies, but has a fallback. For an instance, [tag][tag1] should
        // be tagged [tag][tag-tag1], [tag][tag2] as [tag][tag-tag2], and anything else as [tag][tag3]. 
        // This would be hard to do in other cases, but here, the conditional replacement is above
        // regular replacement and removal. So in the above case, it would support this.
        // If anything but the first two tag combos should be removed, that works too. 
        
        tags = replaceTags(tags, editDetails);
        tags = removeTags(tags, editDetails);
        tags.focus();
    }
}

function replaceTags(tags, editDetails){
    if(DEBUG)
        console.log("Tag replacement");
    var keys = Object.keys(tagReplacements);
    for(var i in keys) for(var j = tags.length - 1; j >= 0; j--){
        var key = keys[i];
        if(tags[j].textContent.match(new RegExp(key))){
            console.log(tags[j]);
            tags[j].children[0].click();
            var dat = tagReplacements[key];
            var len = dat.length;
            addDetails(tagReplacements[key][len - 1], editDetails);
            addTag(tagReplacements[key][0]);
            if(len > 2){
                for(var li = 1; li < len - 1; li++){
                    addTag(tagReplacements[key][li]);
                }
            }
            tags = $(TAG_CLASS);
        }
    }
    return tags;
}

function conditionalBurning(tags, editDetails){
    if(DEBUG)
        console.log("Conditional tag removal");
    var mapped = [];
    for(var x = tags.length - 1; x >= 0; x--){
        mapped.push(tags[x].textContent);
    }
    var keys = Object.keys(removeTagsIfPresent);

    for(var i = 0; i < keys.length; i++) for(var j = tags.length - 1; j >= 0; j--){

        var key = keys[i];
        var value = removeTagsIfPresent[key];
        var necessary = value.additionalTag;
        var reason = value.reason;
        if(DEBUG)
            console.log("Checking for " + key);

        if(tags[j].textContent.match(new RegExp(key))){
            for(var necessaryIndex in necessary){
                var tag = necessary[necessaryIndex];
                if(contains(mapped, new RegExp(tag))){
                    tags[j].children[0].click();

                    addDetails(reason, editDetails);
                    tags = $(TAG_CLASS);
                    break;
                }
            }
        }

    }

    return tags;
}

function addTags(tags, editDetails){

    if(DEBUG)
        console.log("Tag addition: " + tags);
    var mapped = [];
    for(var x = tags.length - 1; x >= 0; x--){
        mapped.push(tags[x].textContent);
    }
    console.log(mapped);
    var keys = Object.keys(cantBeAlone);

    for(var i = 0; i < keys.length; i++){

        var key = keys[i];
        var value = cantBeAlone[key];
        var necessary = value.additionalTag;
        var reason = value.reason;
        var keyRegex = new RegExp(key);

        if(contains(mapped, keyRegex)){
            for(var nTag in necessary){
                var tag = necessary[nTag];
                if(doesNotContain(mapped, new RegExp("^" + tag + "$"))){
                    addDetails(reason, editDetails);
                    if(DEBUG)
                        console.log("Adding tag: " + tag);
                    addTag(tag);
                    tags = $(TAG_CLASS);

                }
            }
        }

    }

    return tags;
}

// SE utils

function addTag(tag){
    $(".tag-editor").find("input").val(tag);
    $(".tag-editor").click();
}

function addDetails(data, editDetails){
    if(data == "" || data == undefined)
        return;
    if(editDetails == undefined){
        console.log("cannot add edit details on undefined element");
    }
    var existing = editDetails.val();
    if(DEBUG)
        console.log(existing);
    if(existing == undefined)
        existing = ""
    else if(existing.length != 0){
        if(existing.substr(-1) !== ".")
            existing = existing + "; ";
        else existing = existing + " ";
    }
    if(existing.contains(data)){
        if(DEBUG)
            console.log("Skipping duplicate reason...");
        return;
    }
    if(DEBUG)
        console.log(existing);
    editDetails.val(existing + data + "; ");
}

function removeTags(tags, editDetails){
    var keys = Object.keys(tagTargets);
    for (var i in keys) for(var j = tags.length - 1; j >= 0; j--){
        var key = keys[i];
        if(tags[j].textContent.match(new RegExp(key))){
            tags[j].children[0].click();

            addDetails(tagTargets[key], editDetails);
            tags = $(TAG_CLASS);
        }
    }
    return tags;
}



// Utils

function doesNotContain(list, regex){
    return !contains(list, regex);
}
function contains(list, regex){
    return list.some((it) => it.match(regex));
}

// Data storage

// TODO for a later release.
function save(key, value){
    localData[DATA_KEY + key] = value;
}

function load(key){
    return localData[key];
}
