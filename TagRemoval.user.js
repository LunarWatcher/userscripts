// ==UserScript==
// @name         Retagger
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.8
// @description  Easy tag burnination, removal, and retagging
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/TagRemoval.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/TagRemoval.meta.js
// ==/UserScript==

class RInfo{
    constructor(reason, additionalTag){
        this.reason = reason;
        this.additionalTag = additionalTag;
    }
}

var reasons = {
    "ide": "IDE tags should not be used for questions that aren't about the IDE itself",
    "genericBurnination": "Removed tag that's in the process of burnination; see meta",
    "python": "Questions on Python-specific versions should also be tagged with Python",
    "java": "Questions tagging with java-specific versions should also be tagged [java]",
    "version": "Questions tagging with specific versions should also be tagged with the base language/tool"
};

var tagTargets = {
    "adobe": "Removed the adobe tag as per https://graphicdesign.meta.stackexchange.com/questions/3455/project-bye-bye-adobe-tag",
    "ibm": "The IBM tag is being burninated. See meta: https://meta.stackoverflow.com/questions/348131/the-ibm-tag-is-in-the-process-of-being-burninated"
};

var removeTagsIfPresent = {
    "android-studio.*": new RInfo(reasons["ide"], ["android", "java"]),
    "intellij-idea.*": new RInfo(reasons["ide"], ["android", "java"])
}

var cantBeAlone = {
    "jquery": new RInfo("jQuery is a library, JS is the language", ["javascript"]),
    "python-.*": new RInfo(reasons["python"], ["python"]),
    "java-.*": new RInfo(reasons["java"], ["java"]),
    "android-studio-.*": new RInfo(reasons["version"], ["android-studio"]),
    "excel-vba": new RInfo("Questions tagged excel-vba should also be tagged with excel and VBA. See meta: https://meta.stackoverflow.com/questions/370095/merging-the-excel-vba-into-vba-speak-now-or-forever-hold-your-peace",
                           ["excel", "vba"])
}

//Format: "tag name": ["tag replacement", "Replacement reason"]
var tagReplacements = {
    "checkout" : ["vcs-checkout", "Checkout is used for questions about finishing transactions, not the version control system feature \"checkout\""],
};

var burn_button = "<a href=\"javascript:void(0);\" id='burn' class='grid--cell s-btn'>Burninate!</a>";

var divClass = ".grid.gs8.gsx.pt12.pb16";

(function() {
    'use strict';

    StackExchange.using('inlineEditing', function() {
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

    if($("#burn").length > 0){
        $("#burn").remove();
    }
    if($("#question").length == 0){
        if($("#title").length == 0)
            return;

        $(burn_button).appendTo(divClass);
    }else{

        $(burn_button).appendTo('#question ' + divClass);

    }
     $("#burn").click(clearTags);

}

function clearTags(){
    var tags = $(".post-tag.rendered-element")
    console.log(tags);
    var editDetails;

    if($("#question").length == 0){
        editDetails = $("#edit-comment");
    }else{
        editDetails = $("#question .edit-comment");
    }

    if(tags !== undefined){
        tags = removeTags(tags, editDetails);
        tags = replaceTags(tags, editDetails);
        tags = addTags(tags, editDetails);
        tags = conditionalBurning(tags, editDetails);
        tags.click();
    }
}

function addDetails(data, editDetails){
    editDetails.append(" " + data + "; ");
}

function removeTags(tags, editDetails){
    var keys = Object.keys(tagTargets);
    for (var i in keys) for(var j = tags.length - 1; j >= 0; j--){
        var key = keys[i];
        if(tags[j].textContent.match(new RegExp(key))){
            tags[j].children[0].click();

            addDetails(tagTargets[key], editDetails);
            tags = $(".post-tag.rendered-element");
        }
    }
    return tags;
}

function replaceTags(tags, editDetails){
    console.log("Tag replacement");
    var keys = Object.keys(tagReplacements);
    for(var i in keys) for(var j = tags.length - 1; j >= 0; j--){
        var key = keys[i];
        if(tags[j].textContent.match(new RegExp(key))){
            tags[j].children[0].click();
            var dat = tagReplacements[key];
            var len = dat.length;
            addDetails(tagReplacements[key][len - 1], editDetails);
            $(".tag-editor").find("input").append(tagReplacements[key][0] + " ");
            if(len > 2){
                for(var li = 1; li < len - 1; li++){
                    addTag(tagReplacements[key][li]);
                }
            }
            tags = $(".post-tag.rendered-element");
        }
    }
    return tags;
}

function conditionalBurning(tags, editDetails){
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
        console.log("Checking for " + key);

        if(tags[j].textContent.match(new RegExp(key))){
            for(var necessaryIndex in necessary){
                var tag = necessary[necessaryIndex];
                if(contains(mapped, new RegExp(tag))){
                    tags[j].children[0].click();

                    addDetails(tagTargets[key], editDetails);
                    tags = $(".post-tag.rendered-element");
                    break;
                }
            }
        }

    }

    return tags;
}

function addTag(tag){
    $(".tag-editor").find("input").append(tag + " ");
}

function addTags(tags, editDetails){
    console.log("Tag addition");
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

            console.log("Checking for " + key + " with " + necessary + " as replacements.");
            for(var nTag in necessary){
                var tag = necessary[nTag];
                if(doesNotContain(mapped, new RegExp("^" + tag + "$"))){
                    addDetails(reason, editDetails);

                    console.log("Adding tag: " + tag);
                    $(".tag-editor").find("input").val(tag);
                    $(".tag-editor").click();
                    tags = $(".post-tag.rendered-element");

                }
            }
        }

    }

    return tags;
}

function doesNotContain(list, regex){
	return !contains(list, regex);
}
function contains(list, regex){
	return list.some((it) => it.match(regex));
}
