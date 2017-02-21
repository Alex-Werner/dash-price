window.addEventListener("load", onLoad());

function onLoad() {
    document.addEventListener('DOMContentLoaded', function() {
        loadOptions();
        document
            .getElementById("save")
            .addEventListener("click", saveOptions);
    });
    
    
    // chrome.runtime.sendMessage({priceHistory: "stuff"},
    //     function (response) {
    //         console.log(response);
    //         if (!response.success)
    //             handleError(url);
    //     });
    // chrome.runtime.sendMessage(evt.detail);
}
function loadOptions() {
    var precision = options.precision.get();
    var e = document.getElementById("precision");
    e.options.selectedIndex=precision; 
    
    var divider = options.divider.get();
    var e = document.getElementById("divider");
    for(var i = 0; i<e.length; i++){
        if(e[i].value==divider){
            e.options.selectedIndex=i;
        }
    }
    
    var refresh = options.refresh.get();
    var e = document.getElementById("refresh");
    for(var i = 0; i<e.length; i++){
        if(e[i].value==refresh){
            e.options.selectedIndex=i;
        }
    }
    
    var currency = options.currency.get();
    var e = document.getElementById("currency");
    for(var i = 0; i<e.length; i++){
        if(e[i].value==currency){
            e.options.selectedIndex=i; 
        }
    }
    
    var notificationMax = options.notificationMax.get();
    var e = document.getElementById("notificationMax");
    if(notificationMax===true){
        e.checked=true;
    }
    
    var notificationMin = options.notificationMin.get();
    var e = document.getElementById("notificationMin");
    if(notificationMin===true){
        e.checked=true;
    }
    
    var lastMax = options.lastMax.get();
    var e = document.getElementById("lastMax");
    e.value = lastMax;
    
    var lastMin = options.lastMin.get();
    var e = document.getElementById("lastMin");
    e.value = lastMin;
    
    var monitorWealth = options.monitorWealth.get();
    var e = document.getElementById("monitorWealth");
    if(monitorWealth===true){
        e.checked=true;
    }
    
    var wealth = options.wealth.get();
    var e = document.getElementById("wealth");
    e.value = wealth;
}

function saveOptions() {
    options.precision.set();
    options.currency.set();
    options.divider.set();
    options.refresh.set();
    options.lastMax.set();
    options.lastMin.set();
    options.notificationMax.set();
    options.notificationMin.set();
    options.monitorWealth.set();
    options.wealth.set();
    refreshBadgeAndTitle();
    clearInterval();
    launchInterval();
    loadOptions();
    setTimeout(function () {
        loadOptions();

    },2000)
    
    
    // var precision = options.precision.get();
    // console.log(precision, currency);
    // function(){
    //     console.log(options);
    //     var precision = options.precision.get();
    //     console.log(precision, currency);
    //     alert('xxx')
    // }
}
