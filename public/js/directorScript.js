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
        htmlPage = '<span class="directorScreen_firmName">' + data.name + '</span>' + '<div class="directorScreen_companyInfo"><span class="directorScreen_firmBalance"> Баланс: ' + data.balance + '₽</span><span class="directorScreen_firmDebt"> Долг за предприятием: ' + data.debt + '₽</span></div>';
        //htmlPage += '<p>' + data.inventory.materialList;  
        $("#main").html(htmlPage);
        firmId = data.firmId;
        $("#count1").text(data.inventory.materialList.material1);
        $("#count2").text(data.inventory.materialList.material2);
        $("#count3").text(data.inventory.materialList.material3);
        $("#count4").text(data.inventory.materialList.material4);
        $("#count5").text(data.inventory.materialList.material5);
        $("#count6").text(data.inventory.materialList.material6);
        $("#count7").text(data.inventory.materialList.material7);
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
    var options =  {
        firmId: firmId,
        //price: $("#requestPrice").val(),
        material1: $("#material1Inp").val(),
        material2: $("#material2Inp").val(),
        material3: $("#material3Inp").val(),
        material4: $("#material4Inp").val(),
        material5: $("#material5Inp").val(),
        material6: $("#material6Inp").val(),
        material7: $("#material7Inp").val()
    };
    console.log(requestObj);
    $.post('/materialRequest', options, function(data){
        if (data.success) alert("заявка отправлена"); 
    });
}

function startProject(){
    var options = {
        firmId: firmId,
        objectName: $("#nameObject").val(),
        square: $("#squareObject").val(),
        pricePerMetre: $("#pricePerMetre").val()
    };
    
    $.post('/startBuilding', options, function(data){
        if (data.success) alert("проект прорабу отправлено");
    });
}
