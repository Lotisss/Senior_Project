/**
 * Created by Joey on 2015/12/7.
 * reference https:https://github.com/binux/yaaw
 * supporting lib: https://github.com/datagraph/jquery-jsonrpc
 */
var Aria2 = function (settings) {
    var jsonrpc_interface = settings.path || "http://localhost:" + settings.port + "/jsonrpc";
    var active_tasks_snapshot = [];
    var error_code_map = {
        0: "",
        1: "unknown error occurred.",
        2: "time out occurred.",
        3: "resource was not found.",
        4: "resource was not found. See --max-file-not-found option.",
        5: "resource was not found. See --lowest-speed-limit option.",
        6: "network problem occurred.",
        7: "unfinished download.",
        8: "remote server did not support resume when resume was required to complete download.",
        9: "there was not enough disk space available.",
        10: "piece length was different from one in .aria2 control file. See --allow-piece-length-change option.",
        11: "aria2 was downloading same file at that moment.",
        12: "aria2 was downloading same info hash torrent at that moment.",
        13: "file already existed. See --allow-overwrite option.",
        14: "renaming file failed. See --auto-file-renaming option.",
        15: "aria2 could not open existing file.",
        16: "aria2 could not create new file or truncate existing file.",
        17: "I/O error occurred.",
        18: "aria2 could not create directory.",
        19: "name resolution failed.",
        20: "could not parse Metalink document.",
        21: "FTP command failed.",
        22: "HTTP response header was bad or unexpected.",
        23: "too many redirections occurred.",
        24: "HTTP authorization failed.",
        25: "aria2 could not parse bencoded file(usually .torrent file).",
        26: ".torrent file was corrupted or missing information that aria2 needed.",
        27: "Magnet URI was bad.",
        28: "bad/unrecognized option was given or unexpected option argument was given.",
        29: "the remote server was unable to handle the request due to a temporary overloading or maintenance.",
        30: "aria2 could not parse JSON-RPC request.",
    };

    function default_error(result) {
        console.debug(result);
    }

    function get_title(result) {
        var dir = result.dir;
        var title = "Unknown";
        if (result.bittorrent && result.bittorrent.info && result.bittorrent.info.name)
            title = result.bittorrent.info.name;
        else if (result.files[0].path.replace(
                new RegExp("^" + dir.replace(/\\/g, "/").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "/?"), "").split("/")[0].length) {
            title = result.files[0].path.replace(new RegExp("^" + dir.replace(/\\/g, "/").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "/?"), "").split("/");
            if (result.bittorrent)
                title = title[0];
            else
                title = title[title.length - 1];
        } else if (result.files.length && result.files[0].uris.length && result.files[0].uris[0].uri)
            title = result.files[0].uris[0].uri.replace(/^\w.+\//, "").replace(/(\?|\&|\#)\w.+/, "");

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
        addUri: function (uri, options, callback) {
            if (!uri) return false;
            if (!$.isArray(uri)) uri = [uri];
            if (!options) options = {};
            ARIA2.request("addUri", [uri, options],
                function (result) {
                    if (result.result)
                        callback(result.result);
                },
                function (result) {
                    console.debug(result);
                });
        },
        getVersion: function (callback) {
            ARIA2.request("getVersion", [],
                function (result) {
                    if (result.result)
                        callback(result.result);
                }
            );
        },
        getGlobalStat: function (callback) {
            ARIA2.request("getGlobalStat", [],
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        return callback(result.result);
                    }
                }
            );
        },
        getGlobalOption: function (callback) {
            ARIA2.request("getGlobalOption", [],
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        return callback(result.result);
                    }
                }
            )
        },
        changeGlobalOption: function (options, callback) {
            ARIA2.request("changeGlobalOption", [options],
                function (result) {
                    if (!result.result)
                        console.warn(result);
                    else {
                        return callback(result.result);
                    }
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
                result.errorEx = error_code_map[result.errorCode];

            }
            return results;
        },
        tellActive: function (auto, callback) {
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
                            ARIA2.tellWaiting(auto, callback);
                        } else {
                            ARIA2.processList(callback);
                        }
                    }
                }
            )
        },
        addTorrent: function (torrent, options, callback) {
            if (!torrent) return false;
            if (!options) options = {};
            ARIA2.request("addTorrent", [torrent, [], options],
                function (result) {
                    if (result.result)
                        callback();
                },
                function (result) {
                    console.debug(result);
                }
            );
        },
        addMetalink: function (metalink, options, callback) {
            if (!metalink) return false;
            if (!options) options = {};
            ARIA2.request("addMetalink", [metalink, [], options],
                function (result) {
                    if (result.result)
                        callback();
                },
                function (result) {
                    console.debug(result);
                }
            );
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
        tellWaiting: function (auto, callback) {
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
                        ARIA2.tellStopped(auto, callback);
                    } else {
                        ARIA2.processList(callback);
                    }
                }
            )
        },
        tellStopped: function (auto, callback) {//(offset, num[,keys])
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
                        ARIA2.processList(callback);
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
        refresh: function (callback) {
            active_tasks_snapshot.length = 0;
            ARIA2.tellActive(true, callback);
        },
        processList: function (callback) {
            active_tasks_snapshot = ARIA2.status_fix(active_tasks_snapshot);
            return callback(active_tasks_snapshot);
        }
    }
};
