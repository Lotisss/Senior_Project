/**
 * Created by Joey on 2015/12/7.
 * reference https:https://github.com/binux/yaaw
 * supporting lib: https://github.com/datagraph/jquery-jsonrpc
 */
var Aria2 = function (settings) {
    var jsonrpc_interface = settings.path || "http://localhost:" + settings.port + "/jsonrpc";
    var active_tasks_snapshot = [], finished_tasks_list = undefined, tasks_cnt_snapshot = "";


    function default_error(result) {
        console.debug(result);
    }

    function get_title(result) {
        var dir = result.dir;
        var title = "Unknown";
        if (result.bittorrent && result.bittorrent.info && result.bittorrent.info.name)
            title = result.bittorrent.info.name;
        else if (result.files[0].path.replace(
                new RegExp("^" + dir.replace(/\\/g, "/").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "/?"), "").split("/").length) {
            title = result.files[0].path.replace(new RegExp("^" + dir.replace(/\\/g, "/").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "/?"), "").split("/");
            if (result.bittorrent)
                title = title[0];
            else
                title = title[title.length - 1];
        } else if (result.files.length && result.files[0].uris.length && result.files[0].uris[0].uri)
            title = result.files[0].uris[0].uri;

        if (result.files.length > 1) {
            var cnt = 0;
            for (var i = 0; i < result.files.length; i++) {
                if (result.files[i].selected == "true")
                    cnt += 1;
            }
            if (cnt > 1)
                title += " (" + cnt + " files..)"
        }
        return title;
    }

    $.jsonRPC.setup({endPoint: jsonrpc_interface, namespace: 'aria2'});

    return {
        request: function (method, params, success, error) {
            if (error == undefined)
                error = default_error;
            if (settings.rpc_secret) {
                params = params || [];
                if (!$.isArray(params)) params = [params];
                params.unshift(settings.rpc_secret);
            }
            $.jsonRPC.request(method, {params: params, success: success, error: error});
        },
        batchRequest: function (method, params, success, error) {
            if (error == undefined)
                error = default_error;
            var commands = [];
            $.each(params, function (i, n) {
                n = n || [];
                if (!$.isArray(n)) n = [n];
                if (settings.rpc_secret) {
                    n.unshift(settings.rpc_secret);
                }
                commands.push({method: method, params: n});
            });
            $.jsonRPC.batchRequest(commands, {success: success, error: error});
        },
        addUri: function (uri, options) {//todo need trigger
            if (!uri) return false;
            if (!$.isArray(uri)) uri = [uri];
            if (!options) options = {};
            ARIA2.request("addUri", [uri, options],
                function (result) {
                    console.debug(result);
                },
                function (result) {
                    console.debug(result);
                });
        },
        getVersion: function () {
            ARIA2.request("getVersion", [],
                function (result) {
                    console.log(result);
                }
            );
        },
        getGlobalStat: function () {// todo need trigger
            ARIA2.request("getGlobalStat", [],
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        $("#totalUploadSpeed").text('{{' + result.downloadSpeed + '|bytes}}');
                        $("#totalDownloadSpeed").text('{{' + result.uploadSpeed + '|bytes}}');
                    }
                }
            );
        },
        getGlobalOption: function () {
            ARIA2.request("getGlobalOption", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        changeGlobalOption: function (options) {
            ARIA2.request("changeGlobalOption", [options],
                function (result) {
                    console.log(result);
                }
            )
        },
        purgeDownloadResult: function () {
            ARIA2.request("purgeDownloadResult", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        status_fix: function (results) {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];

                result.title = get_title(result);
                if (result.totalLength == 0 || parseInt(result.totalLength) == 0)
                    result.progress = 0;
                else {
                    result.progress = (result.completedLength * 1.0 / result.totalLength * 100).toFixed(2);
                    result.totalLength = parseInt(result.totalLength);
                }
                result.eta = (result.totalLength - result.completedLength) / result.downloadSpeed;
                result.downloadSpeed = parseInt(result.downloadSpeed);
                result.uploadSpeed = parseInt(result.uploadSpeed);
                result.uploadLength = parseInt(result.uploadLength);
                result.completedLength = parseInt(result.completedLength);
                result.numSeeders = parseInt(result.numSeeders);
                result.connections = parseInt(result.connections);
                result.numPieces = parseInt(result.numPieces);
                result.pieceLength = parseInt(result.pieceLength);
                for (var j = 0; j < result.files.length; j++) {
                    var file = result.files[j];
                    file.completedLength = parseInt(result.files[j].completedLength);
                    file.length = parseInt(result.files[j].length);
                    file.index = parseInt(result.files[j].index);
                    file.title = file.path.replace(new RegExp("^" + result.dir.replace(/\\/g, "[\\/]") + "/?"), "");
                    file.selected = file.selected == "true";
                }

            }
            return results;
        },
        tellActive: function (auto) {
            if (!auto) {
                active_tasks_snapshot.length = 0;
            }
            ARIA2.request("tellActive", [],
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        $.each(result.result, function (i, e) {
                            active_tasks_snapshot.push(e);
                        });
                        if (auto) {
                            ARIA2.tellWaiting(auto);
                        } else {
                            ARIA2.processList();
                        }
                    }
                }
            )
        },

        addTorrent: function (torrent, options) {
            if (!torrent) return false;
            if (!options) options = {};
            ARIA2.request("addTorrent", [torrent, [], options],
                function (result) {
                    console.log(result);
                }
            )
        },
        addMetalink: function (metalink, options) {
            if (!metalink) return false;
            if (!options) options = {};
            ARIA2.request("addMetalink", [metalink, [], options],
                function (result) {
                    console.log(result);
                }
            )
        },
        remove: function () {//(gid)
            ARIA2.request("remove", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        forceRemove: function () {//(gid)
            ARIA2.request("forceRemove", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        pause: function () {//(gid)
            ARIA2.request("pause", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        pauseAll: function () {//(none)
            ARIA2.request("pauseAll", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        forcePause: function () {//(gid)
            ARIA2.request("forcePause", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        forcePauseAll: function () {//(none)
            ARIA2.request("forcePauseAll", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        unpause: function () {//(gid)
            ARIA2.request("unpause", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        unpauseAll: function () {//(none)
            ARIA2.request("unpauseAll", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        tellStatus: function (gid) {//(gid [, keys])
            ARIA2.request("tellStatus", [gid],
                function (result) {
                    console.log(result);
                }
            )
        },
        getUris: function (uri, options) {//(gid)
            if (!uri) return false;
            if (!$.isArray(uri)) uri = [uri];
            if (!options) options = {};
            ARIA2.request("getUris", [uri, options],
                function (result) {
                    console.log(result);
                }
            )
        },
        getFiles: function () {//(gid)
            ARIA2.request("getFiles", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        getPeers: function () {//(gid)
            ARIA2.request("getPeers", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        getServers: function () {//(gid)
            ARIA2.request("getServers", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        tellWaiting: function (auto) {
            if (!auto) {
                active_tasks_snapshot.length = 0;
            }
            var params = [0, 1000];
            ARIA2.request("tellWaiting", params,
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        $.each(result.result, function (i, e) {
                            active_tasks_snapshot.push(e);
                        });
                    }
                    if (auto) {
                        ARIA2.tellStopped(auto);
                    } else {
                        ARIA2.processList();
                    }
                }
            )
        },
        tellStopped: function (auto) {//(offset, num[,keys])
            if (!auto) {
                active_tasks_snapshot.length = 0;
            }
            var params = [0, 1000];
            ARIA2.request("tellStopped", params,
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        $.each(result.result, function (i, e) {
                            active_tasks_snapshot.push(e);
                        });
                        ARIA2.processList();
                    }
                }
            )
        },
        changePosition: function () {//(gid, pos, how)
            ARIA2.request("changePosition", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        changeUri: function () {//(gid, fileIndex, delUris, addUris[, position])
            ARIA2.request("changeUri", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        getOption: function () {//(gid)
            ARIA2.request("getOption", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        changeOption: function () {//(gid, options)
            ARIA2.request("changeOption", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        removeDownloadResult: function () {//(gid)
            ARIA2.request("removeDownloadResult", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        getSessionInfo: function () {//(none)
            ARIA2.request("getSessionInfo", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        shutdown: function () {//(none)
            ARIA2.request("shutdown", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        forceShutdown: function () {//(none)
            ARIA2.request("forceShutdown", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        saveSession: function () {//(none)
            ARIA2.request("saveSession", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        /*multical: function () {//sustem.multical(methods)
         ARIA2.request("multical", [],
         function (result) {
         console.log(result);
         }
         )
         },*/
        onDownloadStart: function () {//(event)
            ARIA2.request("onDownloadStart", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        onDownloadPause: function () {//(event)
            ARIA2.request("onDownloadPause", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        onDownloadStop: function () {//(event)
            ARIA2.request("onDownloadStop", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        onDownloadComplete: function () {//(event)
            ARIA2.request("onDownloadComplete", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        onDownloadError: function () {//(event)
            ARIA2.request("onDownloadError", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        onBtDownloadComplete: function () {//(event)
            ARIA2.request("onBtDownloadComplete", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        refresh: function () {
            active_tasks_snapshot.length = 0;
            ARIA2.tellActive(true);
        },
        processList: function () {
            active_tasks_snapshot = ARIA2.status_fix(active_tasks_snapshot);
            List.length = 0;
            $.extend(List, active_tasks_snapshot);
        }
    }
};
