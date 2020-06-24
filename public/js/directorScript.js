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

var firmId;

function GetFirmInfo(){
    var directorId = getCookie("userId");
    var htmlPage;
    $.post("/getFirmByDirectorId", {userId: directorId}, function(data){
        htmlPage = '<h1>' + data.name + '</h1><br>' + '<p>' + data.balance + '<p>' + data.debt;
        htmlPage += '<p>' + data.inventory.materialList;  
        $("#main").html(htmlPage);
        firmId = data.firmId;
    });  
}

GetFirmInfo();
setInterval(GetFirmInfo, 10000);

function SendRequest(){
    var requestObj = {};
    
    $(".field").each(function() {
        if (this.checked) {
            requestObj[this.id] = $("#" + this.id + "Inp").val();
        }
    });
    console.log(requestObj);
    $.post('/materialRequest', { firmId: firmId, request: requestObj, price: $("#requestPrice").val() }, function(data){
        if (data.success) alert("заявка отправлена"); 
    });
}

function GetPrices(){
    var htmlTable = '<table>';
    htmlTable += '<th>material</th><th>price</th>';
    
    $.post('/checkPrices', {}, function(data){
        console.log(data);
        $("#contractorPrice1").text(data.material1);
        $("#contractorPrice2").text(data.material2);
        $("#contractorPrice3").text(data.material3);
    });
        //ФОРМИРУЕМ ТУТ ТАБЛИЧКУ С ЦЕНАМИ ПО material1, material2, material3
        
        
}