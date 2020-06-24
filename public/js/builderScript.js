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
    firmId = getCookie("firmId");
    var htmlPage;
    $.post("/getFirmById", {firmId: firmId}, function(data){
        htmlPage = '<h1>' + data.name + '</h1><br>';  
        $("#firmInfo").html(htmlPage);
        $("#count1").text(data.inventory.materialList.material1);
        $("#count2").text(data.inventory.materialList.material2);
        $("#count3").text(data.inventory.materialList.material3);
    });  
}

GetFirmInfo();

function MaterialWaste(idMaterial){
    $.post("/setFirmMaterial", {firmId: firmId, count: $("#wastedCount" + idMaterial).val(), idMaterial: idMaterial}, function(data){
        if (data.success) alert("материалы потрачены");   
    });
}