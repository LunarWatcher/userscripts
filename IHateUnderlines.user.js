// ==UserScript==
// @name         I hate underlines!
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.0-patch-1
// @description  Removes underlines from links in the SE network.
// @author       Olivia Zoe
// @include      /^https?:\/\/\w*.?(stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com\/.*/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/IHateUnderlines.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/IHateUnderlines.meta.js
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Works straight forward: injects some CSS that forces removal of text decoration
     */
    var cssElement = document.createElement("style");
    cssElement.type = "text/css";
    cssElement.innerHTML =
        "a { " +
        "    text-decoration: none !important;" +
        "}";
    document.body.appendChild(cssElement);
})();
