function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
}

if (getCookie("role") === "banker") {
    $("#start").css("visibility", "visible");
    };

function checkStatus() {
    $.post("/checkStatus", {}, function(returnedData){
        if (returnedData.gameStarted) 
            {
                console.log("gameStarted");
                if (getCookie("role") === "director") {
                    window.location.href = "/directorScreen";
                }
                //window.location.href = "/"
            }
        else console.log("gameNotStarted");
    });
    
}

function startGame() {
    $.post("/startGame");
    if (getCookie("role") === "banker") {
        window.location.href = "/bankerScreen";
    }
}

setInterval(checkStatus, 10000);