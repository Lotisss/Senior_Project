/**
 * Created by Joey on 2015/12/9.
 */
var DBFactory = (function () {
    var db;
    return {
        init: function (callback) {
            var request = window.indexedDB.open("TaskStorage", 1);
            request.onupgradeneeded = function (event) {
                // Create an objectStore for this database
                var store = event.target.result.createObjectStore("Tasks", {keyPath: "gid"});
                store.createIndex("status", "status", {unique: false});
            };
            request.onsuccess = function (e) {
                db = e.target.result;
                callback();
            };
        },
        addRecord: function (task, callback) {
            var transaction = db.transaction(['Tasks'], 'readwrite');
            var store = transaction.objectStore('Tasks');
            task.created = Date.now();
            var request = store.put(task);
            transaction.oncomplete = function (e) {
                callback();
            };
        },
        getRecord: function (gid, callback) {
            var transaction = db.transaction(['Tasks'], 'readonly');
            var store = transaction.objectStore('Tasks');
            var request = store.get(gid);
            transaction.oncomplete = function (e) {
                callback();
            };
        },
        getAllRecord: function (callback) {
            var transaction = db.transaction(['Tasks'], 'readonly');
            var store = transaction.objectStore('Tasks');

            // Get everything in the store
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            // This fires once per row in the store, so for simplicity
            // collect the data in an array (data) and send it pass it
            // in the callback in one go
            var data = [];
            cursorRequest.onsuccess = function (e) {
                var result = e.target.result;

                // If there's data, add it to array
                if (result) {
                    data.push(result.value);
                    result.continue();

                    // Reach the end of the data
                } else {
                    callback(data);
                }
            };
        },
        delRecord: function (gid, callback) {
            var transaction = db.transaction(['Tasks'], 'readwrite');
            var store = transaction.objectStore('Tasks');
            var request = store.delete(gid);
            transaction.oncomplete = function (e) {
                callback();
            };
        },
        updateRecord: function (task, callback) {
            var transaction = db.transaction(['Tasks'], 'readwrite');
            var store = transaction.objectStore('Tasks');
            task.updated = Date.now();
            var request = store.put(task);
            transaction.oncomplete = function (e) {
                callback();
            };
        }

    }
});