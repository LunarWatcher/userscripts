// ==UserScript==
// @name         Tag removal
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0
// @description  Easy tag burnination or removal
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// ==/UserScript==

var reasons = {
    "ide": "IDE tags should not be used for questions that aren't about the IDE itself"
};
var tagTargets = {
    "adobe": "Removed the adobe tag as per https://graphicdesign.meta.stackexchange.com/questions/3455/project-bye-bye-adobe-tag",
    "android-studio": reasons["ide"],
    "intellij": reasons["ide"]
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
    console.log(document);
    var tags = $(".post-tag")
    var editDetails = $("#edit-comment");

    if(tags !== undefined){
        var keys = Object.keys(tagTargets);
        outer: for (var i in keys) for(var j in tags){
            var key = keys[i];
            console.log("Checking for the tag " + key);;
            if(tags[j].textContent === key){
                tags[j].remove();
                editDetails.val(tagTargets[key] + "; ");
                tags = $(".post-tag");
                continue outer;
            }
        }
    }
}
