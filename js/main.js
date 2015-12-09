/**
 * Created by Joey on 2015/12/1.
 */

//$(".switch").bootstrapSwitch();
(function () {
    'use strict';
    angular.module('taskPanel', []).filter('bytes', function () {
        return function (bytes, precision) {
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
    }).filter('title', function () {
        return function (title, precision) {
            if (title.length > parseInt(precision))
                return title.substring(0, parseInt(precision)) + "..";
            else
                return title;
        }
    }).factory('CurrentTask', function () {
        var current = {};
        if (List.length)
            $.extend(current, List[0]);
        return current;
    }).controller('taskListController', function (CurrentTask, $scope) {
        this.list = List;

        this.setCurrentTask = function (Ntask) {
            CurrentTask.bittorrent = null;
            $.extend(CurrentTask, Ntask);
            this.list.forEach(function (element) {
                element.active = false;
            });
            Ntask.active = true;
        };
        $scope.$watch(List, function () {
            setTimeout(function () {
                if (List.length)
                    $.extend(CurrentTask, List[0]);
                $scope.$apply(); //this triggers a $digest
            }, 100);
        });

    }).controller('taskViewController', function (CurrentTask) {
        this.tab = 1;
        this.task = CurrentTask;

        this.setTab = function (tabN) {
            this.tab = tabN;
        };
        this.isTab = function (tabN) {
            return this.tab === tabN;
        };
    }).controller('Aria2Controller', function () {

    });

})();
var globalSettings = {
    rpc_secret: "token:secrettoken",
    host: "localhost",
    port: 6800
};
var List = [];
/* List = [
 {
 title: "file1",
 completedLength: 1000206345,
 totalLength: 7068176341,
 active: true,
 bittorrent: {
 announceList:[]
 },
 connections:0,
 dir: "Downloads",
 downloadSpeed:0,
 eta:NaN,
 files: [
 {
 index:1,
 length: 7068176341,
 completedLength: 1000206345,
 selected:true,
 path:"",
 uris:[]
 }
 ],
 gid:0,
 infoHash:"",
 numPieces:0,
 numSeeders:0,
 pieceLength:123,
 progress:0,
 status:"active",
 uploadLength:0,
 uploadSpeed:0
 }
 ];
 */
var ARIA2 = Aria2(globalSettings);
var DB = DBFactory();
var init = function () {
    $("#addTaskURL").keyup(function () {
            var value = $(this).val();
            var pattern = "((http|ftp|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?";
            if (value.match(pattern)) {
                $("#addTaskURLGroup").removeClass("has-error").addClass("has-success");
                $("#addTaskAdd").prop('disabled', false);
            } else {
                $("#addTaskURLGroup").removeClass("has-success").addClass("has-error");
                $("#addTaskAdd").prop('disabled', true);
            }
        }
    );
    $("#addTaskAdd").click(function () {
        var uri = $("#addTaskURL").val();
        ARIA2.addUri(uri, null, function () {
            $("#modalAddTask").modal("hide");
        });
    });
    $("#BTNFresh").click(function () {
        ARIA2.refresh();
    });
    ARIA2.getVersion();
    ARIA2.refresh();

    DB.init(function () {
        console.log("DB initialized");
    });

};
init();
