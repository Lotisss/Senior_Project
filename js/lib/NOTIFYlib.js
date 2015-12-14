/**
 * Created by Joey on 2015/12/13.
 */
var Notify = function () {
    return {
        success: function (msg) {
            var msgOpt = {
                type: "basic",
                title: "Aria2 Download",
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
        }

    }
};