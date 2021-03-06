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

function GetRequest(){
    var materialsName = ['Фундамент', 'Cтены', 'Крыша', 'Степлер', 'Скотч', 'Скрепки', 'Скобы для степлера'];
    $.post('/checkRequests', {}, function(data){
        var htmlTable = '<table>';
        htmlTable += '<th>Фирма</th><th>Бюджет</th><th>Материалы</th><th>Управление</th>';
        data.forEach(function(item){
            console.log(item);
            if (item.status == 3 && item.firm.firmId == getCookie("firmId")) {
                htmlTable += '<tr><td>' + item.firm.name + '</td><td>' + item.firm.balance + '</td>';
                htmlTable += '<td>';
                
                for (var i = 1; i < 8; i++){
                    if (item.materials["material"+i] > 0) 
                        htmlTable += materialsName[i-1] + ':' + item.materials["material"+i] + '<br>';
                }
                htmlTable += '</td>';
                htmlTable += '<td><input type="button" value="✓" onclick="SendRequest('+item.id+')"><input type="number" id="input'+ item.id +'" value="0"></td></tr>';           
            }
        });
        htmlTable += '</table>';
        $("#main").html(htmlTable);
    });
}

function SendRequest(id){
    $.post('/setRequestStatus', {status: 0, price: $("#input" + id).val(), requestId: id}, function(data){
        if (data.success) alert("заявка отправлена");
    });
}

function GetFirmInfo(){
    var firmId = getCookie("firmId");
    var htmlPage;
    $.post("/getFirmById", {firmId: firmId}, function(data){
        htmlPage = '<h1>' + data.name + '</h1><div class="financerScreen_block">' + '<span class="financerScreen_balance">Баланс: ' + data.balance + '₽</span><span class="financerScreen_debt"> Долг: ' + data.debt +"₽</span></div>";  
        $("#firmInfo").html(htmlPage);
    });  
}

GetFirmInfo();

function GetPrices(){
    var htmlTable = '<table>';
    htmlTable += '<th>material</th><th>price</th>';
    
    $.post('/checkPrices', {}, function(data){
        console.log(data);
        $("#contractorPrice1").text(data.material1);
        $("#contractorPrice2").text(data.material2);
        $("#contractorPrice3").text(data.material3);
        $("#contractorPrice4").text(data.material4);
        $("#contractorPrice5").text(data.material5);
        $("#contractorPrice6").text(data.material6);
        $("#contractorPrice7").text(data.material7);
    });
        //ФОРМИРУЕМ ТУТ ТАБЛИЧКУ С ЦЕНАМИ ПО material1, material2, material3        
}