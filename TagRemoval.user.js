// ==UserScript==
// @name         Retagger
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.5
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
    "python": "Questions on Python-specific versions should also be tagged with Python"
};
var tagTargets = {
    "adobe": "Removed the adobe tag as per https://graphicdesign.meta.stackexchange.com/questions/3455/project-bye-bye-adobe-tag",
    "android-studio": reasons["ide"],
    "android-studio-2.2.3": reasons["ide"],
    "android-studio-3.0": reasons["ide"],
    "android-studio-3.1": reasons["ide"],
    "android-studio-3.1.3": reasons["ide"],
    "android-studio-3.2": reasons["ide"],
    "intellij": reasons["ide"],
    "intellij-idea": reasons["ide"]
};

//Needs regex <.<
var cantBeAlone = {
    "jquery": new RInfo("jQuery is a library, JS is the language", "javascript"),
    "python-3.x": new RInfo(reasons["python"], "python"),
    "python-2.x": new RInfo(reasons["python"], "python"),
    "python-2.7": new RInfo(reasons["python"], "python"),
    "python-2.6": new RInfo(reasons["python"], "python"),
    "python-3.6": new RInfo(reasons["python"], "python"),
    "python-3.5": new RInfo(reasons["python"], "python"),
    "python-3.4": new RInfo(reasons["python"], "python"),
    "python-3.3": new RInfo(reasons["python"], "python")
}

//Format: "tag name": ["tag replacement", "Replacement reason"]
var tagReplacements = {
    "checkout" : ["vcs-checkout", "Checkout is used for questions about finishing transactions, not the version control system feature \"checkout\""]
};

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
        $("<a href=\"javascript:void(0);\" id='burn'>Burninate!</a>").appendTo('.form-submit');
    }else{

        $("<a href=\"javascript:void(0);\" id='burn'>Burninate!</a>").appendTo('#question .form-submit');
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
        tags.click();
    }
}

function addDetails(data, editDetails){
    if(editDetails.textContent === undefined){
        editDetails.val(data + "; ");
    }else{
        editDetails.val(editDetails.textContent + " " + data + "; ");
    }
}

function removeTags(tags, editDetails){
    var keys = Object.keys(tagTargets);
    for (var i in keys) for(var j = tags.length - 1; j >= 0; j--){
        var key = keys[i];
        console.log("Checking for the tag " + key);
        if(tags[j].textContent === key){
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
        console.log("Checking for the tag " + key);
        if(tags[j].textContent === key){
            tags[j].children[0].click();
            addDetails(tagReplacements[key][1], editDetails);
            $(".tag-editor").find("input").val(tagReplacements[nKey][0]);
            tags = $(".post-tag.rendered-element");
        }
    }
    return tags;
}

function addTags(tags, editDetails){
    console.log("Tag addition");
    var mapped = [];
    for(var x = tags.length - 1; x >= 0; x--){
        mapped.push(tags[x].textContent);
    }
    console.log(mapped);
    var keys = Object.keys(cantBeAlone);
    console.log(keys);
    console.log(keys.length);

    for(var i = 0; i < keys.length; i++){
        var key = keys[i];
        var value = cantBeAlone[key];
        var necessary = value.additionalTag;
        var reason = value.reason;
        console.log("Checking for " + key);

        if(contains.call(mapped, key) && !contains.call(mapped, necessary)){
            addDetails(reason, editDetails);
            $(".tag-editor").find("input").val(value.additionalTag);
            tags = $(".post-tag.rendered-element");
        }
    }

    return tags;
}

var contains = function(item) {
    var indexOf = Array.prototype.indexOf;
    return indexOf.call(this, item) > -1;
};
