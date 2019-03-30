// ==UserScript==
// @name         Higgs review enhancer
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.0
// @include      https://higgs.sobotics.org/review
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/HiggsReviewEnhancer/ReviewEnhancer.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/HiggsReviewEnhancer/ReviewEnhancer.meta.js
// @author       Olivia Zoe
// ==/UserScript==

const s = 83;
const n = 78;
const f = 70;
const t = 84;
const k = 75;
const enter = 13;

var data = {
    "selected": null
};
var ids = {
    0: "sk", 1: "nc", 2: "fp", 3: "tp"
};

function initButtons() {
    let buttons = $(".btn");
    buttons.eq(0).attr("id", "sk");
    buttons.eq(1).attr("id", "nc");
    buttons.eq(2).attr("id", "fp");
    buttons.eq(4).attr("id", "tp");
            
}

function initMutationObserver() {
    var observer = new MutationObserver(function(mutations, observer) {
        let count = 0;
        for(let i in mutations) {
            let mutation = mutations[i];
            if (mutation.target.className == "d-flex flex-row") {
                count++;
                if(count >= 5) 
                    initButtons();
            }
            console.log(mutation.target.className);
            console.log(mutation.target.className == "d-flex flex-row");
        }
    });

    observer.observe(document.getElementsByTagName("body")[0], { childList: true, subtree: true });
}

(function() {
    "use strict";
    $("body").append("<style>.highlight {-moz-box-shadow: 0px 0px 10px gray; -webkit-box-shadow: 0px 0px 10px gray; box-shadow: 0px 0px 10px gray;}</style>");
    initMutationObserver();
    
    $(document).keydown(function(e){
        let key = e.which;
        if(key == enter) {
            if(data.selected == null) return;
            switch(data.selected) {
                case 0: 
                    $("#sk").click();
                    data.selected = null;
                    break;
                case 1: 
                    $("#nc").click();
                    data.selected = null;
                    break;
                case 2: 
                    $("#fp").click();
                    data.selected = null;
                    break;
                case 3: 
                    $("#tp").click();
                    data.selected = null;
                    break;
                default:
                    console.log("Unknown: " + data.selected);
                    break;
            }
        } else if(key == s) {
            data.selected = 0;
        } else if(key == n) {
            data.selected = 1;
        } else if(key == f) {
            data.selected = 2;
        } else if(key == k || key == t) {
            data.selected = 3;
        } else console.log(key.which);
        let selected = data.selected;
        for (var i = 0; i < 4; i++) {
            let btn = $("#" + ids[i]).addClass("highlight");
            if (selected != null && i == selected) btn.addClass("highlight");
            else btn.removeClass("highlight");
        }
        
    }); 
})();

