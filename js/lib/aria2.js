/**
 * Created by Joey on 2015/12/7.
 * reference https:https://github.com/binux/yaaw
 * supporting lib: https://github.com/datagraph/jquery-jsonrpc
 */
var Aria2 = function (settings) {
    var jsonrpc_interface = settings.path || "http://localhost:" + settings.port + "/jsonrpc";

    function default_error(result) {
        console.debug(result);
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
        addUri: function (uri, options) {//(uris[,options [,position]])
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
        getGlobalStat: function () {
            ARIA2.request("getGlobalStat", [],
                function (result) {
                    console.log(result);
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
        tellActive: function () {
            ARIA2.request("tellActive", [["gid"]],
                function (result) {
                    console.log(result);
                }
            )
        },
        addTorrent: function (torrent) {//(torrent[, uris[[, options[,position]]])
            ARIA2.request("addTorrent", [torrent],
                function (result) {
                    console.log(result);
                }
            )
        },
        addMetalink: function () {//(metalink[, option[, position]])
            ARIA2.request("addMetalink", [],
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
        tellStatus: function () {//(gid [, keys])
            ARIA2.request("tellStatus", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        getUris: function () {//(gid)
            ARIA2.request("getUris", [],
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
        tellWaiting: function () {//(offset, num[, keys])
            ARIA2.request("tellWaiting", [],
                function (result) {
                    console.log(result);
                }
            )
        },
        tellStopped: function () {//(offset, num[,keys])
            ARIA2.request("tellStopped", [],
                function (result) {
                    console.log(result);
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
    }
};
