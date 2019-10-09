// ==UserScript==
// @name         Show me the votes
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.0
// @description  Automatically shows votes on posts where the score is 0 (see https://meta.stackoverflow.com/q/390178/6296561)
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/(questions|posts|review|tools)\/(?!tagged\/|new\/).*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/VoteRevealer.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/VoteRevealer.user.js
// ==/UserScript==

(function() {
    'use strict';
    $(document).ajaxComplete(function() {
        let objs = $(".js-vote-count");
        for (let i = 0; i < objs.length; i++) if (objs[i].innerHTML == "0") setTimeout(() => { objs[i].click(); }, 1100 * i);
    });
})();
