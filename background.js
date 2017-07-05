window.addEventListener("load", loadBackground());
var fetchInterval;
function loadBackground() {
    var valid = store.validateIntegrity();
    if(valid){
        prepareBadge();
        prepareListener();
    
    
        DashPrice
            .fetch
            .currencyList()
            .then(function () {
                DashPrice
                    .fetch
                    .vergePrice()
                    .then(function () {
                        setTitle();
                        if(shouldMonitorWealth()===true){
                            var wealth = DashPrice.getWealth()
                            setBadge(wealth);
                        }else{
                            setBadge();
                        }
                        launchInterval();
                    })
            })
    }else{
        loadBackground();
    }
}

function fetchDashPrice(cb) {
    DashPrice
        .fetch
        .vergePrice()
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
