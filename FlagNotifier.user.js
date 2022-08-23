// ==UserScript==
// @name         Flag notifier
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.0
// @description  Better notifications for chat flags
// @author       Olivia Zoe
// @include      /^https?:\/\/chat.(meta.)?(stackoverflow|stackexchange)\.com\/rooms\/.*$/
// @grant        none
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/FlagNotifier.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/FlagNotifier.user.js
// 
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

let enabled = false;

$(document).ready(function() {
    'use strict';
    if (CHAT && CHAT.addEventHandlerHook) {
        
        console.log("Event added");
        CHAT.addEventHandlerHook(chatListener);
        console.log(CHAT.CURRENT_ROOM_ID);
        enabled = GM_getValue("room-" + CHAT.CURRENT_ROOM_ID);
        console.log(enabled);
        console.log(GM_getValue("room-" + CHAT.CURRENT_ROOM_ID));
      
        $("#sidebar-menu").append("| <a id='flagNotify' href='#' onclick='return false'>" + (enabled ? "Disable" : "Enable") + " flag pings</a>");
  
        $("#flagNotify").click(function () {
            Notification.requestPermission();

            enabled = !enabled;
            GM_setValue("room-" + CHAT.CURRENT_ROOM_ID, enabled);
            console.log("Value: " + GM_getValue("room-" + CHAT.CURRENT_ROOM_ID));
            $("#flagNotify").text((enabled ? "Disable" : "Enable") + " flag pings");
        });
      
    }
});

// cache for previously flagged posts, to avoid multiple pings in case several are raised. not sure what condition those flags satisfy, but I'd rather not check.
// A cache isn't too expensive anyway. It's wiped when the list is refreshed
// the size is also capped at 15 because why not?
let handled = []

function chatListener({event_type, user_id, message_id, room_id}) {
    if (!enabled) {
        return;
    } 

    if (event_type == 9 || event_type == 12) {
         if (handled.some(id => message_id === id)) return;
        handled.push(message_id);
        if (handled.length >= 15) {
            handled.shift();
        }
      
        let a = new Audio(event_type == 9 ? '//cdn-chat.sstatic.net/chat/so.mp3' : '//cdn-chat.sstatic.net/chat/meta.mp3');
        a.loop = false;
        a.play();
      
        var notification = new Notification("Chat flag raised", {
            icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
            body: (event_type == 9 ? "Flag raised" : "Mod flag raised") + " in room " + room_id
        });

        notification.onclick = function () {
            window.open(url);
        };
    }
}
