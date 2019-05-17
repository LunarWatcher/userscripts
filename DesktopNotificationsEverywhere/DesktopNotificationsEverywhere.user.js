// ==UserScript==
// @name         Desktop Notifications Everywhere
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.0
// @description  Sends desktop notifications for every message sent
// @author       Olivia Zoe
// @match        *://chat.stackexchange.com/rooms/*
// @match        *://chat.meta.stackexchange.com/rooms/*
// @match        *://chat.stackoverflow.com/rooms/*
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/DesktopNotificationsEverywhere/DesktopNotificationsEverywhere.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/DesktopNotificationsEverywhere/DesktopNotificationsEverywhere.meta.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

var url = null;
var uid = 0;
var room = "";
var toggled = false;

function load() {
    var value = GM_getValue("room-" + room);
    if (value == null) return false;
    else return value == "true" || value == "1";
}

function save() {
    GM_setValue("room-" + room, toggled);

}

$(document).ready(function () {
    // Parse various necessary data
    url = window.location.href;
    let i = $("#active-user").attr("class");
    uid = parseInt(i.replace("user-container user-", ""), 10);
    if (uid == 0) throw "Failed to find UID";

    room = $("#roomname").text();

    // Link the event handler
    CHAT.addEventHandlerHook(chatMessageRecieved);

    toggled = load();

    // Link toggler

     $("#sidebar-menu").append("| <a id='toggleAllNotifications' href='#' onclick='return false'>" + (toggled ? "Disable" : "Enable") + " all notifications</a>");


    $("#toggleAllNotifications").click(function () {
        toggleNotifications();
    });
});

function toggleNotifications() {
    toggled = !toggled;
    $("#toggleAllNotifications").text((toggled ? "Disable" : "Enable") + " all notifications");
    save();
}

function chatMessageRecieved({event_type, user_id, content, user_name}) {

    if(!toggled) return;
    if (event_type !== 1) {
        return false;
    }

    if(user_id == uid) return; // Ignore your own messages
    var text = $('<div>').html(content).text();
    if (text == "" || text == null) text = "<Image>"
    notify(text, user_name);

}


function notify(content, username) {

    if (Notification.permission !== 'granted')
        Notification.requestPermission();
    else {
        var notification = new Notification(room + " | " + username, {
            icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
            body: content
        });

        notification.onclick = function () {
            window.open(url);
        };

    }

}
