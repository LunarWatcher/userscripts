// ==UserScript==
// @name         Retagger
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.2
// @description  Easy tag burnination, removal, and retagging
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// ==/UserScript==

var reasons = {
    "ide": "IDE tags should not be used for questions that aren't about the IDE itself",
    "genericBurnination": "Removed tag that's in the process of burnination; see meta"
};
var tagTargets = {
    "adobe": "Removed the adobe tag as per https://graphicdesign.meta.stackexchange.com/questions/3455/project-bye-bye-adobe-tag",
    "android-studio": reasons["ide"],
    "intellij": reasons["ide"]
};

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
        var keys = Object.keys(tagTargets);
        for (var i in keys) for(var j = tags.length - 1; j >= 0; j--){
            var key = keys[i];
            console.log("Checking for the tag " + key);
            if(tags[j].textContent === key){
                tags[j].children[0].click();
                editDetails.val(tagTargets[key] + "; ");
                tags = $(".post-tag");
            }
        }
        keys = Object.keys(tagReplacements);
        for( var n in keys) for(var m = tags.length - 1; m >= 0; m--){
            var nKey = keys[n];
            console.log("Checking for the tag " + nKey);
            if(tags[m].textContent === nKey){
                tags[m].children[0].click();
                editDetails.val(tagReplacements[nKey][1] + "; ");
                $(".tag-editor").find("input").val(tagReplacements[nKey][0]);
                tags = $(".post-tag.rendered-element");
            }
        }
    }
}
