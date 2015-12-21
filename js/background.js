/**
 * Created by Joey on 2015/12/14.
 */
var preStat = "";
var preList = [];
var NOTIFY = Notify();

var interval_id;
var intF = function (start) {
    if (interval_id)
        window.clearInterval(interval_id);
    if (!start) {
        return;
    }
    interval_id = window.setInterval(function () {
        refresh();
    }, 5000)
};

var refresh = function () {
    var listChange = false;
    ARIA2.getGlobalStat(function (re) {
        var curStat = "" + re.numActive + "," + re.numWaiting + "," + re.numStopped;

        if (curStat !== preStat) {
            listChange = true;
            preStat = curStat;
            localStorage.preStat = preStat;
        }

        if (listChange)
            ARIA2.refresh(function (list) {
                var stateC = [];
                $.each(list, function (ni, nn) {
                    var found = false;
                    $.each(preList, function (pi, pn) {
                        if (pn.gid == nn.gid) {
                            found = true;
                            if (pn.status != nn.status)
                                if (nn.status.match(/(complete|error)/))
                                    stateC.push(nn);
                        }
                    });
                    if (!found) {
                        stateC.push(nn);
                    }
                });
                preList = [];
                $.extend(preList, list);
                localStorage.preList = JSON.stringify(preList);
                if (stateC.length) {
                    var tore = [];
                    $.each(stateC, function (i, task) {
                        var smsg = {
                            title: task.title,
                            message: task.status.match(/(complete|error)/) ? task.status : "Added"
                        };
                        tore.push(smsg);
                        if (!globalSettings.inShortMsg) {
                            NOTIFY.basic(smsg.title, smsg.message);

                        }
                    });
                    if (globalSettings.inShortMsg)
                        NOTIFY.list("Download Task", "A", tore);
                }
            });
    });
};

chrome.extension.onConnect.addListener(function (port) {

    port.onMessage.addListener(function (msg) {
        mag = JSON.parse(msg);
        intF(msg.notification);
        console.log(msg);
    });
});

intF(globalSettings.notification);

if (chrome.downloads.setShelfEnabled)
    chrome.downloads.setShelfEnabled(false);


