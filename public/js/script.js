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


if(getCookie('userId')) {

} else {
    $.post('/getId', { field1: "hello", field2 : "hello2"},
        function(returnedData){
            setCookie('userId', `${returnedData}`, 12);
        });
}


function DirectorClick(){
    $("#firmName")[0].disabled = !$("#director")[0].checked;
}

var currentField;

function SendResult(){
    $(".field").each(function() {
        if (this.checked) {
            currentField = this.id;
        }
    });
    
    var firmName = document.getElementById("firmName").value;
    $.post('/setRole', { userId: getCookie('userId'), role : currentField, firmName: firmName },
        function(returnedData){
            setCookie('userId', `${returnedData}`, 12);
        });
}

function GetFirmList(){
    $.post('/getFirmList', {}, function(returnedData){
        $("#firmList").text("")
        console.log(returnedData);
        returnedData.forEach(function(item){
            $("#firmList").append(item.name + "<br>");
        });
    });
    
}

