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

GetFirmInfo();
ProjectsInfo();

function GetFirmInfo(){
    var firmId = getCookie("firmId");
    var htmlPage;
    $.post("/getFirmById", {firmId: firmId}, function(data){
        htmlPage = '<h1>' + data.name + '</h1><div class="financerScreen_block">' + '<span class="financerScreen_balance">Баланс: ' + data.balance + '₽</span><span class="financerScreen_debt"> Долг: ' + data.debt +"₽</span></div>";  
        $("#firmInfo").html(htmlPage);
    });  
}

function ProjectsInfo(){
    var statuses = ['', '', 'заложен фундамент', 'построены стены', 'построена крыша', 'дом построен'];
    
    $.post('/getAllProjects', {}, function(data){
        $.post('/getCustomerInfo', {}, function(customerData){
              
            var htmlTable = '<table>';
            htmlTable += '<th>Номер проекта</th><th>Название проекта</th><th>Фирма-исполнитель</th><th>Площадь</th><th>Себестоимость</th><th>Статус</th><th>Цена продажи</th><th>Продать</th>';
            var rowIndex = 0;
            data.forEach(function(item){
            if (item.firmId == firmId){
                htmlTable += '<tr><td>' + item.globalId + '</td><td>' + item.name + '</td><td>' + item.firmName + '</td><td>' + item.square + '</td><td>' + item.pricePerMetre + '</td><td>' + statuses[item.status] + '</td>';
                if (item.isSelled){
                    
                    htmlTable += '<td>'+item.selledPrice +'</td><td>Продано</td></tr>';
                }
                else {
                    htmlTable += '<td><input type="number" id="priceForSell'+rowIndex+'"></td><td><select id="selectId'+rowIndex+'">';
                    customerData.forEach(function(customerItem){
                    
                        htmlTable += '<option value="'+customerItem.customerId+'">' + customerItem.customerId + '</option>';
                    })
                    htmlTable += '</select><input type="button" value="Продать" onclick="Sell('+item.globalId+','+rowIndex+')"></tr>';
                }
                
                rowIndex++;
            }
        });
        htmlTable += '</table>';
        $("#firmProjects").html(htmlTable);
        });
        console.log(data);
    });
}

function Sell(globalId, rowIndex){
    var customerId = $("#selectId"+rowIndex).val();
    $.post('/sellObject', {globalId: globalId, customerId: customerId, priceForSell: $("#priceForSell"+rowIndex).val()}, function(data){
        if (data.success) alert("заявка отправлена");
    });
}