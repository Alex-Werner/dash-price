window.addEventListener("load", loadBackground());
var fetchInterval;
function loadBackground() {
    prepareBadge();
    prepareListener();
    
    
    DashPrice
        .fetch
        .currencyList()
        .then(function () {
            DashPrice
                .fetch
                .dashPrice()
                .then(function () {
                    setTitle();
                    setBadge();
                    launchInterval();
                })
        })
}

function fetchDashPrice(cb) {
    DashPrice
        .fetch
        .dashPrice()
        .then(function () {
            setTitle();
            setBadge();
        })
}


function prepareListener() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log('Received');
            
            if (sender.tab) {
                //RECEIVED FROM A CONTENT SCRIPT : Options ?
            } else {
                //RECEIVED FROM THE EXTENSION (POPUP)
                if (request && request.hasOwnProperty('type')) {
                    switch (request.type) {
                        case "priceHistory":
                            sendResponse(DashPrice.getPriceHistory());
                            break;
                    }
                }
                
            }
        }
    )
}