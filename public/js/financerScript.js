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
    $.post('/checkRequests', {}, function(data){
        var htmlTable = '<table>';
        htmlTable += '<th>Фирма</th><th>Бюджет</th><th>Материал 1</th><th>Материал 2</th><th>Материал 3</th><th>Управление</th>';
        data.forEach(function(item){
            console.log(item);
            if (item.status == 3) {
                htmlTable += '<tr><td>' + item.firm.name + '</td><td>' + item.firm.balance + '</td><td>' + item.materials.material1 + '</td><td>' + item.materials.material2 + '</td><td>' + item.materials.material3 + '</td>';
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
    var financerId = getCookie("userId");
    var htmlPage;
    $.post("/getFirmByDirectorId", {userId: }, function(data){
        htmlPage = '<h1>' + data.name + '</h1><br>' + '<p>' + data.balance + '<p>' + data.debt;
        htmlPage += '<p>' + data.inventory.materialList;  
        $("#main").html(htmlPage);
        firmId = data.firmId;
    });  
}

GetFirmInfo();