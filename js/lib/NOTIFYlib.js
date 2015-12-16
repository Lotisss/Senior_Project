/**
 * Created by Joey on 2015/12/13.
 */
var Notify = function () {
    return {
        basic: function (title, msg) {
            var msgOpt = {
                type: "basic",
                title: title,
                iconUrl: "/img/icon96.png",
                message: msg
            };
            chrome.notifications.create("Aria2", msgOpt, function () {

            });
        },
        error: function (msg) {

        },
        showProgress: function (title, msg, progress) {
            var msgOpt = {
                type: "progress",
                title: "Aria2 Download",
                iconUrl: "/img/icon96.png",
                message: title,
                contextMessage: msg,
                progress: progress
            };
            chrome.notifications.create("Aria2", msgOpt, function () {

            });
        },
        list: function (title, msg, list) {
            var msgOpt = {
                type: "list",
                title: title,
                iconUrl: "/img/icon96.png",
                message: msg,
                items: list
            };
            chrome.notifications.create("Aria2", msgOpt, function () {
            });

        }
    };
};