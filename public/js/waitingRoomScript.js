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
    $("#bankerOptions").css("visibility", "visible");
    };

function checkStatus() {
    $.post("/checkStatus", {}, function(returnedData){
        if (returnedData.gameStarted) 
            {
                console.log("gameStarted");
                if (getCookie("role") === "director") {
                    window.location.href = "/directorScreen";
                }
                if (getCookie("role") === "contractor") {
                    window.location.href = "/contractorScreen";
                }
                if (getCookie("role") === "customer") {
                    window.location.href = "/customerScreen";
                }
                if (getCookie("role") === "foreman") {
                    window.location.href = "/foremanScreen";
                }
                if (getCookie("role") === "driver") {
                    window.location.href = "/driverScreen";
                }
                if (getCookie("role") === "manager") {
                    window.location.href = "/managerScreen";
                }
                if (getCookie("role") === "financer") {
                    window.location.href = "/financerScreen";
                }
                if (getCookie("role") === "builder") {
                    window.location.href = "/builderScreen";
                }
                //window.location.href = "/"
            }
        else console.log("gameNotStarted");
    });
    
}

function startGame() {
    $.post("/startGame", {customerBudget: $("#customerBudget").val(), password: });
    if (getCookie("role") === "banker") {
        window.location.href = "/bankerScreen";
    }
}

setInterval(checkStatus, 10000);