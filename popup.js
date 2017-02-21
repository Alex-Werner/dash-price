window.addEventListener("load", loadPopup());

function rotateRefreshIcon() {
    // transform: rotate(12deg);
    var refreshIcon = document.getElementById("refresh-icon");
    var rotateValue = 0;
    var refreshInt = setInterval(function(){
        rotateValue+=10;
        if(rotateValue>1080){
            clearInterval(refreshInt)
            refreshIcon.style.transform="rotate(0deg)";
            loadOptions();
        }
        refreshIcon.style.transform="rotate("+rotateValue+"deg)";
    },10)
   
    
}
var optionsSelected = false;
function toggleOptions(){
    var quicklinks = document.getElementById("quicklinks");
    var optionsTable = document.getElementById("options-table");
    var optionsIcon = document.getElementById("options-icon");
    if(!optionsSelected){
        optionsIcon.style.backgroundImage="url(images/options_selected.png)";
        quicklinks.style.display="none";
        optionsTable.style.display="block";
    }else{
        optionsIcon.style.backgroundImage="url(images/options.png)";
        quicklinks.style.display="block";
        optionsTable.style.display="none";
    }
    loadOptions();
    optionsSelected=!optionsSelected;
    
    
    
}
function loadPopup() {
    window.onload = function(){
        displayStuff()
        var editorExtensionId = "ogmiolejjgikhpbhnbnkdlhopfknldcb";
    
        chrome.runtime.sendMessage({type: "priceHistory"},
            function (response) {
                console.log(response);
            });
        // chrome.runtime.sendMessage(evt.detail);
    
    
        var dashIcon = document.getElementById("logo-icon");
        dashIcon.onclick=function(e){
            var redirectWindow = window.open('https://www.dash.org', '_blank');
            redirectWindow.location;
        };
        var refreshIcon = document.getElementById("refresh-icon");
        refreshIcon.onclick=function(e){
            rotateRefreshIcon();
            refreshBadgeAndTitle()
        };
        var optionsIcon = document.getElementById("options-icon");
        optionsIcon.onclick=function(e){
            toggleOptions();
        }; 
        var githubIcon = document.getElementById("github-icon");
        githubIcon.onclick=function(e){
            var redirectWindow = window.open('https://github.com/Alex-Werner/dash-price', '_blank');
            redirectWindow.location;
        };
    }
   
}