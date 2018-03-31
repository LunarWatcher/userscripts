// ==UserScript==
// @name         No ducks
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Gets rid of Quack Overflow in the Stack Exchange network.
// @author       Olivia Zoe
// @match       *://*.stackexchange.com/*
// @match       *://*.stackoverflow.com/*
// @match       *://*.superuser.com/*
// @match       *://*.serverfault.com/*
// @match       *://*.askubuntu.com/*
// @match       *://*.stackapps.com/*
// @match       *://*.mathoverflow.net/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
    $(".quackoverflow").hide();
})();
