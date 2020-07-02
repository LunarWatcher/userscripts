// ==UserScript==
// @name         Retagger
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.3.1
// @description  Easy tag burnination, removal, and retagging
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/TagRemoval.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/TagRemoval.user.js
// ==/UserScript==

class ReplacementInfo{
    constructor(reason, additionalTag){
        this.reason = reason;
        this.additionalTag = additionalTag;
    }
}

class ReplacementInfo3 {
    constructor(reason, targets, replacements) {
        this.reason = reason;
        this.targets = targets;
        this.replacements = replacements;
    }
}

const reasons = {
    "ide": "IDE tags should not be used for questions that aren't about the IDE itself",
    "genericBurnination": "Removed tag that's in the process of burnination; see meta",
    "python": "Questions on Python-specific versions should also be tagged with Python",
    "java": "Questions tagging with java-specific versions should also be tagged [java]",
    "version": "Questions tagging with specific versions should also be tagged with the base language/tool"
};
const androidJavaCombo = ["^android$", "^java$"];
const tagTargets = {
    "code-review": reasons.genericBurnination,
    "^design$": "The design tag is being burninated. See meta: https://meta.stackoverflow.com/questions/320690/the-design-tag-is-being-burninated"
};

const removeTagsIfPresent = {
    "android-studio.*": new ReplacementInfo(reasons.ide, androidJavaCombo),
    "intellij-idea.*": new ReplacementInfo(reasons.ide, androidJavaCombo)
}

// TODO more sensible naming
const cantBeAlone = {
    "^jquery": new ReplacementInfo("jQuery is a library, JS is the language", ["javascript"]),
    "^python-.*": new ReplacementInfo(reasons.python, ["python"]),
    "^java-.*": new ReplacementInfo(reasons.java, ["java"]),
    "^android-studio-.*": new ReplacementInfo(reasons.version, ["android-studio"])
}

//Format: "tag name": ["tag replacement", "Replacement reason"]
const tagReplacements = {
    "^checkout$" : ["vcs-checkout", "Checkout is used for questions about finishing transactions, not the version control system feature \"checkout\""],
    "^excel-vba$": [ "excel vba", "excel-vba is being burninated; DO NOT USE!"]
};

// NOTE: Additions here are not required to be an array.
const conditionalTagReplacements = {
    "^glide$": [ new ReplacementInfo3("[glide] does not refer to the Android library - please use [android-glide] instead", androidJavaCombo, ["android-glide"]), 
                 new ReplacementInfo3("[glide] does not refer to the Go package manager - please use [glide-golang] instead.", [ "^go$" ], ["glide-golang"])
               ]
   
    
};
let functions = [ addTags, conditionalBurning, replaceTags, removeTags, conditionalReplaceTags ];


const divClass = ".grid.gs8.gsx.pt12.pb16";
const TAG_CLASS = ".s-tag.rendered-element";
const EDITOR_CLASS = ".wmd-input";
const BUTTON_ID = "burn";
const INLINE_BUTTON_ID = "burn-inline";

const burn_button = "<a href=\"javascript:void(0);\" id='" + BUTTON_ID + "' class='grid--cell s-btn'>Burninate!</a>";
const burnInline_button = "<a href=\"javascript:void(0);\" id='" + INLINE_BUTTON_ID + "' class='grid--cell s-btn'>Burninate!</a>";
const auto10k = "<a href=\"javascript:void(0);\" id='auto10k' class='grid--cell s-btn'>Auto burn!</a>";
const DATA_KEY = "Retagger-";
const DEBUG = false;

const INLINE_10K = "#edit-tags";

var autoBurn = false;

(function() {
    'use strict';
    StackExchange.using('inlineEditing',function() {
        StackExchange.ready(function() {
            $('#post-form').each(function(){
                init();
                if (autoBurn) {
                    autoBurn = false;
                    clearTags();
                }
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
        $(burnInline_button).appendTo("#question .form-submit.grid.gs4.mt8");
    }
    $("#burn").click(clearTags);
    $("#" + INLINE_BUTTON_ID).click(clearTags);
    
    if ($(INLINE_10K).length > 0) {
        $(auto10k).appendTo("#question .post-menu");
        $("#auto10k").click(autoClearTags);
    }

}

function autoClearTags() {
    autoBurn = true;
    $('#question .edit-post')[0].click();
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
        
        
        for (var func in functions) {
            functions[func](tags, editDetails);
            tags = $(TAG_CLASS);
        }
        tags.focus();
    }
}

function replaceTags(tags, editDetails){
    if(DEBUG)
        console.log("Tag replacement");
    var keys = Object.keys(tagReplacements);
    for(var i in keys){
        var key = keys[i];
        for(var j = tags.length - 1; j >= 0; j--){
            
            if(tags[j].textContent.match(new RegExp(key))){
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
    }
    return tags;
}

function conditionalReplaceTags(tags, editDetails) {
    var keys = Object.keys(conditionalTagReplacements);
    var mapped = [];
    for(var x = tags.length - 1; x >= 0; x--){
        mapped.push(tags[x].textContent);
    }
    for (var i in keys) {
        let key = keys[i];
        for(var j = tags.length - 1; j >= 0; j--) {
            if(tags[j].textContent.match(new RegExp(key))) {
                var data = conditionalTagReplacements[key];
                if(data.length) {
                    for(var di in data) {
                        var actualData = data[di];
                        condRep(key, tags, editDetails, mapped, j, actualData);
                        tags = $(TAG_CLASS);
                    }
                } else condRep(key, tags, editDetails, mapped, j, data)
                
                tags = $(TAG_CLASS);
            }
        }
    }
}

function condRep(key, tags, editDetails, mapped, j, data) {
    if(!(data instanceof ReplacementInfo3)) {
        throw new TypeError("Type mismatch: data needs to be instanceof ReplacementInfo3");
    }
    var orCondition = data.targets;
    var replacements = data.replacements;
    if(replacements.length == 0) throw new Error("conditonalReplaceTags: Use replaceTags for this tag instead. Offending tag: " + key);
    for(var ki in orCondition) {
        if(contains(mapped, new RegExp(orCondition[ki]))) {
            tags[j].children[0].click();
            addDetails(data.reason, editDetails);
            for(ti in replacements) {
                            
                var tag = replacements[ti];
                if(!contains(mapped, new RegExp(tag)))
                    addTag(tag);
                }
            
            break;
        }
    }
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
