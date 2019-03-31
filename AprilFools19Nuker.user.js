// ==UserScript==
// @name         The 90's are out
// @version      1.0.0
// @author       Olivia Zoe
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// ==/UserScript==

(function() {
    "use strict";
    $.cookie("tm2019", "1", { expires: 2, path: '/' }); // source: https://meta.stackexchange.com/a/326007/332043
})();
