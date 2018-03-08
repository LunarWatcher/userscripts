// ==UserScript==
// @name         Hide starboard
// @namespace    https://github.com/LunarWatcher/userscripts/
// @version      1.0.0
// @description  Hides the starboard
// @author       Olivia
// @match        https://chat.stackoverflow.com/rooms/139/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
    $("#starred-posts").hide();
})();
