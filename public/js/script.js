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

function updateInfo() {

}

function SendResult(){
    $(".field").each(function() {
        if (this.checked) {
            currentField = this.id;
        }
    });

    var resultRole = "";
    var firmId = currentField.split("-")[1];
    if(currentField.includes('firm')) {
        resultRole = $('[firm-data="' + firmId + '"]')[0].value
    } else {
        resultRole = currentField
    }
    
    setCookie("firmId", firmId);
    var firmName = document.getElementById("firmName").value;
    $.post('/setRole', { userId: getCookie('userId'), role : resultRole, firmName: firmName, firmId: firmId },
        function(returnedData){
            if(returnedData.error) {
                alert(returnedData.error);
            }
            else{
                setCookie("role", resultRole, 12);
                window.location.href = "/waitingRoom";
            }
        });
}

function init() {
    GetFirmList();
}

function GetFirmList(){
    $.post('/getFirmList', {}, function(returnedData){
        $("#firmList").text("")
        console.log(returnedData);
        returnedData.forEach(function(item, index){
            var checkBox = "<input class='field' type='radio' name='field' id='firm-" + item.firmId + "'>"
            var selectHTML = "<select firm-data='" + index + "'>";
            for (var roleName in item.roles) {
                if(!item.roles[roleName].userId)  {
                    selectHTML += "<option id='" + roleName +"' value='" + roleName +"'>" + item.roles[roleName].name + "</option>";
                }
            }
            selectHTML += "</select>";
            $("#firmList").append(checkBox + item.name + selectHTML + "<br>");
        });
    });
}

setInterval(updateInfo, 2000);
init();

