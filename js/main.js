/**
 * Created by Joey on 2015/12/1.
 */
$("#totalUploadSpeed").text("N/A");
$("#totalDownloadSpeed").text("N/A");
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
    }).factory('CurrentTask', function () {
        var current = {};
        if (List.length)
            $.extend(current, List[0]);
        return current;
    }).controller('taskListController', function (CurrentTask) {
        this.list = List;

        this.setCurrentTask = function (Ntask) {
            $.extend(CurrentTask, Ntask);
            this.list.forEach(function (element) {
                element.active = false;
            });
            Ntask.active = true;
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
    }).controller('Aria2Controller', function () {

    });

})();
var globalSettings = {
    rpc_secret: "token:secrettoken",
    host: "localhost",
    port: 6800
};
var List = [
    {
        name: "file1",
        download: 1000206345,
        total: 7068176341,
        peers: [],
        isBT: false,
        state: "active",
        path: "Downloads",
        files: [
            {
                name: "file1.txt",
                size: 7068176341,
                download: 1000206345
            }
        ]
    },
    {
        name: "file2",
        download: 1084671,
        total: 2097196,
        peers: [
            {
                ip: "123.3.12.1",
                client: "Transmitter",
                progress: 80,
                upSpeed: 89797,
                downSpeed: 8978
            }
        ],
        isBT: true,
        state: "active",
        path: "Downloads",
        files: [
            {
                name: "file2.txt",
                size: 109871,
                download: 21987
            },
            {
                name: "file2.zip",
                size: 1019898,
                download: 898719
            }
        ]
    }
];

var ARIA2 = Aria2(globalSettings);
ARIA2.getVersion();
ARIA2.tellActive();