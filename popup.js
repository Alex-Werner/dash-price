window.addEventListener("load", loadPopup());

function loadPopup() {
    var editorExtensionId = "ogmiolejjgikhpbhnbnkdlhopfknldcb";
    
    chrome.runtime.sendMessage({type: "priceHistory"},
        function (response) {
            console.log(response);
        });
    // chrome.runtime.sendMessage(evt.detail);
    
}