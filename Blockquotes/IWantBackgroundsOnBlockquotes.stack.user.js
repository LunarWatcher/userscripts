// ==UserScript==
// @name         Bring back blockquotes with a background
// @namespace    https://github.com/lunarwatcher/userscripts
// @version      1.0
// @description  try to take over the world!
// @author       Olivia Zoe
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @match        *://*.area51.stackexchange.com/*
// @exclude      *://chat.stackexchange.com/*
// @exclude      *://chat.meta.stackexchange.com/*
// @exclude      *://chat.stackoverflow.com/*
// @exclude      *://blog.stackoverflow.com/*
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/Blockquotes/IWantBackgroundsOnBlockquotes.stack.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/Blockquotes/IWantBackgroundsOnBlockquotes.stack.meta.js
// ==/UserScript==

(function() {
    'use strict';

    let css =`
blockquote {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #fbf2d4 !important;
    border-left: 2px solid #ffeb8e !important;
}

blockquote::before {
    background: none !important; /*change to the value of border-left for a border with the same style as the new quotes. Setting this to none disables it and entirely reverts votes*/
}
`;

    let styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

})();
