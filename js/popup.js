/**
 * Created by Joey on 2015/12/2.
 */
$("#DPageLink").click(function(){
    chrome.tabs.create({"url":"main.html","selected":true});
});
var port = chrome.extension.connect({name: "Sample Communication"});
port.postMessage("Hi BackGround");
port.onMessage.addListener(function (msg) {
    console.log("message recieved" + msg);
});