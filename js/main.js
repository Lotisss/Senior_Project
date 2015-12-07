/**
 * Created by Joey on 2015/12/1.
 */
$("#totalUploadSpeed").text("N/A");
$("#totalDownloadSpeed").text("N/A");
//$(".switch").bootstrapSwitch();
(function () {
    var app = angular.module('taskPanel', []);

    app.factory('CurrentTask', function () {
        var current = {};
        $.extend(current, List[0]);
        return current;
    });

    app.controller('taskListController', function (CurrentTask) {
        this.list = [];
        this.list = List;

        this.setCurrentTask = function (Ntask) {
            $.extend(CurrentTask, Ntask);
            this.list.forEach(function (element) {
                element.active = false;
            });
            Ntask.active = true;
        }

    });

    app.controller('taskViewController', function (CurrentTask) {
        this.tab = 1;
        this.task = CurrentTask;

        this.setTab = function (tabN) {
            this.tab = tabN;
        };

        this.isTab = function (tabN) {
            return this.tab === tabN;
        }
    });

    var List = [
        {
            name: "file1",
            download: 10,
            total: 70,
            peers: [],
            isBT: false,
            state: "active",
            path: "Downloads",
            files: [
                {
                    name: "file1.txt",
                    size: 70,
                    download: 10
                }
            ]
        },
        {
            name: "file2",
            download: 10,
            total: 20,
            peers: [
                {
                    ip: "123.3.12.1",
                    client: "Transmitter",
                    progress: 80,
                    upSpeed: 10,
                    downSpeed: 10
                }
            ],
            isBT: true,
            state: "active",
            path: "Downloads",
            files: [
                {
                    name: "file2.txt",
                    size: 10,
                    download: 2
                },
                {
                    name: "file2.zip",
                    size: 10,
                    download: 8
                }
            ]
        }
    ]
})();