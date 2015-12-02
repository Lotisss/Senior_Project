/**
 * Created by Joey on 2015/12/2.
 */
$("#DPageLink").click(function(){
    chrome.tabs.create({"url":"main.html","selected":true});
});