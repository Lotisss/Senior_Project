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
        addUri: function (uri, options) {
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
        tellActive: function (keys) {
            ARIA2.request("tellActive", [["gid"]],
                function (result) {
                    console.log(result);
                }
            )
        },
    }
};
