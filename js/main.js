/**
 * Created by Joey on 2015/12/1.
 */
var DB = DBFactory();
//var NOTIFY = Notify();
/**
 * @return {string}
 */
var SizeConverter = function (bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
        number = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
    if (number) {
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
    else {
        return '0 B';
    }
};
(function () {
    'use strict';
    angular.module('taskPanel', []).filter('bytes', function () {
        return SizeConverter;
    }).filter('title', function () {
        return function (title, precision) {
            if (title && title.length > parseInt(precision))
                return title.substring(0, parseInt(precision)) + "..";
            else {
                return title;
            }
        }
    }).filter('time', function () {
        return function (seconds) {
            if (seconds)
                return new Date(1970, 0, 1).setSeconds(seconds);
            else
                return "infinity";
        }
    }).factory('CurrentTask', function () {
        return {};
    }).controller('taskListController', function (CurrentTask, $scope) {
        ARIA2.refresh(function (list) {
            $scope.taskList = list;
            $scope.$apply();
        });

        this.setCurrentTask = function (Ntask) {
            CurrentTask.bittorrent = null;
            $.extend(CurrentTask, Ntask);
            $scope.taskList.forEach(function (element) {
                element.active = false;
            });
            Ntask.active = true;
            globalSettings.refreshPause = true;
        };

    }).controller('taskViewController', function (CurrentTask) {
        this.tab = 1;
        this.task = CurrentTask;

        this.setTab = function (tabN) {
            this.tab = tabN;
        };
        this.isTab = function (tabN) {
            return this.tab === tabN;
        };
    }).controller('Aria2Controller', function ($scope, CurrentTask) {
        var refresh = function () {
            ARIA2.getGlobalStat(function (re) {
                $("#totalDownloadSpeed").val(SizeConverter(re.downloadSpeed, 2) + "/s");
                $("#totalUploadSpeed").val(SizeConverter(re.uploadSpeed, 2) + "/s");
                ARIA2.refresh(function (list) {
                    $scope.taskList = list;
                    globalSettings.refreshPause = false;
                    delete CurrentTask.title;
                    $scope.$apply();
                });
            });
        };
        this.delTask = function () {
            var gid = CurrentTask.gid;
            ARIA2.remove(gid, function (re) {
                refresh();
            });
        };
        this.pauTask = function () {
            var gid = CurrentTask.gid;
            ARIA2.pause(gid, function (re) {
                refresh();
            });
        };
        this.startTask = function () {
            var gid = CurrentTask.gid;
            if (CurrentTask.status == 'paused')
                ARIA2.unpause(gid, function (re) {
                    refresh();
                });
            else if (CurrentTask.status.match(/(error|removed)/)) {
                var uris = [];
                $.each(CurrentTask.files, function (n, e) {
                    if (e.uris.length)
                        uris.push(e.uris[0].uri);
                });
                if (uris.length > 0)
                    ARIA2.getOption(gid, function (re) {
                        ARIA2.madd_task(uris, re, function (result) {
                            ARIA2.remove(gid, function (result) {
                                refresh();
                            })
                        })
                    });
            }
        };
        this.refresh = refresh;
    }).controller('globalSetting', function ($scope) {
        var interval_id;
        var preList = "";
        var refresh = function () {
            var listChange = false;
            ARIA2.getGlobalStat(function (re) {
                $("#totalDownloadSpeed").text(SizeConverter(re.downloadSpeed, 2) + "/s");
                $("#totalUploadSpeed").text(SizeConverter(re.uploadSpeed, 2) + "/s");
                var curList = "" + re.numActive + "," + re.numWaiting + "," + re.numStopped;
                if (curList != preList) {
                    listChange = true;
                    preList = curList;
                }
                if (!globalSettings.refreshPause || listChange)
                    ARIA2.refresh(function (list) {
                        $.extend($scope.taskList, list);
                        $scope.$apply();
                    });
            });
        };
        var intF = function () {
            if (interval_id)
                window.clearInterval(interval_id);
            if (!(globalSettings.refresh > 0)) {
                return;
            }
            interval_id = window.setInterval(function () {
                refresh();
            }, globalSettings.refresh * 1000)
        };
        intF();
        $scope.Aria2 = {
            MODL: 0,
            MOUL: 0,
            MCD: 0,
            MSS: 0,
            UA: ""
        };
        this.fetchOptions = function () {
            ARIA2.getGlobalOption(function (re) {
                $scope.Aria2.MODL = parseInt(re['max-overall-download-limit']);
                $scope.Aria2.MOUL = parseInt(re['max-overall-upload-limit']);
                $scope.Aria2.MCD = parseInt(re['max-concurrent-downloads']);
                $scope.Aria2.MSS = (parseInt(re['min-split-size']) / 1048576);
                $scope.Aria2.UA = re['user-agent'];
                $scope.$apply();
            })
        };
        this.update = function () {
            var option = {};
            option['max-overall-download-limit'] = $scope.Aria2.MODL;
            option['max-overall-upload-limit'] = $scope.Aria2.MOUL;
            option['max-concurrent-downloads'] = $scope.Aria2.MCD;
            option['min-split-size'] = $scope.Aria2.MSS * 1048576;
            option['user-agent'] = $scope.Aria2.UA;
            ARIA2.changeGlobalOption(option, function () {
                $("#modalSettings").modal("hide");
                intF();
            });
            var SPN = $("#settingsPort");
            if (parseInt(SPN.val()) != globalSettings.port) {
                globalSettings.port = SPN.val();
                ARIA2 = Aria2(globalSettings);
            }
            localStorage.setItem("globalSettings", JSON.stringify(globalSettings));
        };
        this.fetchOptions();
    });

})();

var getOptions = function () {
    //todo reader required;
    return null
};
var settingsInit = function () {
    var SRBtn = $("#settingsRefresh");
    var SBtn = $("#settingsBell");
    var SRI = $("#settingsRefreshInput");
    var SPN = $("#settingsPort");
    SPN.val(globalSettings.port);
    if (globalSettings.refresh > 0)
        SRI.val(globalSettings.refresh);
    else {
        SRBtn.removeClass("btn-primary");
        SRI.prop("disabled", true).val('');
    }
    var port = chrome.extension.connect({name: "Sample Communication"});
    port.onMessage.addListener(function (msg) {
        console.log("message recieved" + msg);
    });
    if (!globalSettings.notification)
        SBtn.removeClass("btn-primary");
    SBtn.click(function () {
        globalSettings.notification = !globalSettings.notification;
        if (globalSettings.notification) {
            $(this).addClass("btn-primary");
        }
        else
            $(this).removeClass("btn-primary");
        port.postMessage("{notification:" + globalSettings.notification + "}");
    });

    SRBtn.click(function () {
        if (globalSettings.refresh > 0) {
            $(this).removeClass("btn-primary");
            globalSettings.refresh = -1;
            SRI.prop("disabled", true).val('');
        } else {
            $(this).addClass("btn-primary");
            globalSettings.refresh = 1;
            SRI.prop("disabled", false).val(1);
        }
    });
};
var init = function () {
    settingsInit();
    var ADTBtn = $("#addTaskAdd");
    var ADTURi = $("#addTaskURL");
    var ADTURiG = $("#addTaskURLGroup");
    var ADTFIT = $("#fileInputTorrent");
    var URLPattern = "((http|ftp|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?";
    var magnetPattern = /^magnet:\?xt=urn:.{20,70}/;
    var torrent_file, file_type;
    var cleanADT = function (gid) {
        $("#modalAddTask").modal("hide");
        ADTURiG.removeClass("has-success");
        ADTBtn.prop('disabled', true);
        ADTURi.val("");
        ADTURi.attr("placeholder", "");
        torrent_file = null;
        file_type = null;
        ADTFIT.empty();
        //NOTIFY.showProgress("A new task added", "GID:" + gid, 0);
        ARIA2.tellStatus(gid, function (task) {
            DB.addRecord(task, function () {
            })
        });

    };
    ADTURi.bind('input propertychange', (function () {
            var value = $(this).val();
            if (value.match(URLPattern) || value.match(magnetPattern || torrent_file)) {
                ADTURiG.removeClass("has-error").addClass("has-success");
                ADTBtn.prop('disabled', false);
            } else {
                ADTURiG.removeClass("has-success").addClass("has-error");
                ADTBtn.prop('disabled', true);
            }
        }
    ));

    ADTBtn.click(function () {
        var uri = ADTURi.val();
        if (uri.match(URLPattern))
            ARIA2.addUri(uri, getOptions(), function (re) {
                cleanADT(re);
            });
        else if (uri.match(magnetPattern))
            ARIA2.addUri(uri, getOptions(), function (re) {
                cleanADT(re);
            });
        else if (torrent_file)
            if (file_type.indexOf("metalink") != -1)
                ARIA2.addMetalink(torrent_file, getOptions(), function (re) {
                    cleanADT(re);
                });
            else
                ARIA2.addTorrent(torrent_file, getOptions(), function (re) {
                    cleanADT(re);
                });

    });
    if (window.FileReader) {
        ADTFIT.get(0).onchange = function (e) {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                ADTURiG.removeClass("has-error").addClass("has-success");
                ADTBtn.prop('disabled', false);
                ADTURi.attr("placeholder", file.name);
                torrent_file = e.target.result.replace(/.*?base64,/, "");
                file_type = file.type;
            };
            reader.readAsDataURL(file);
        }
    }

    ARIA2.getVersion(function (re) {
        $("#setAriaVer").text(" ver." + re.version)
    });
    DB.init(function () {
        console.log("DB initialized");
    });
};
//NOTIFY.success("Init success");
init();