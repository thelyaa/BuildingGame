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
    $.post("/getFirmById", {firmId: firmId}, function(data){
        htmlPage = '<h1>' + data.name + '</h1>';  
        $("#firmInfo").html(htmlPage);
    });    
}

function GetRequest(){
    var materialsName = ['Фундамент', 'Cтены', 'Крыша', 'Степлер', 'Скотч', 'Скрепки', 'Скобы для степлера'];
    $.post('/checkRequests', {}, function(data){
        var htmlTable = '<table>';
        htmlTable += '<th>Фирма</th><th>Материалы</th><th>Статус</th>';
        data.forEach(function(item){
            console.log(item);
            if ((item.status == 1 || item.status == 4) && item.firm.firmId == getCookie("firmId")) {
                htmlTable += '<tr><td>' + item.firm.name + '</td>';
                htmlTable += '<td>';
                
                for (var i = 1; i < 8; i++){
                    if (item.materials["material"+i] > 0) 
                        htmlTable += materialsName[i-1] + ':' + item.materials["material"+i] + '<br>';
                }
                htmlTable += '</td>';
                if (item.status == 1) htmlTable += '<td>Ожидает доставки</td>';
                else htmlTable += '<td>Выполнена</td>';
            }
            
        });
        htmlTable += '</table>';
        $("#main").html(htmlTable);
    });
}

GetFirmInfo();
GetRequest();