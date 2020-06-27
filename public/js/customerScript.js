function ProjectsInfo(){
    var statuses = ['', '', 'заложен фундамент', 'построены стены', 'построена крыша', 'дом построен'];
    $.post('/getAllProjects', {}, function(data){
        console.log(data);
        var htmlTable = '<table>';
        htmlTable += '<th>Номер проекта</th><th>Название проекта</th><th>Фирма-исполнитель</th><th>Площадь</th><th>Себестоимость</th><th>Статус</th><th>Приобрести</th>';
        data.forEach(function(item){
            htmlTable += '<tr><td>' + item.globalId + '</td><td>' + item.name + '</td><td>' + item.firmName + '</td><td>' + item.square + '</td><td>' + item.pricePerMetre + '</td><td>' + statuses[item.status] + '</td>';
            htmlTable += '<td><input type="button" value="Приобрести" onclick="BuySector('+item.globalId+','+ item.id+')"></td>';
        });
        htmlTable += '</table>';
        $("#projects").html(htmlTable);
    });
}

ProjectsInfo();

function BuySector(globalId, id){
    var options = {
        parterId: getCookie("userId"),
        globalId: globalId,
        id: id,
        part: $("#buyingSquare").val()
    };
    $.post('/buySector', options, function(data){
        if (data.success) alert("приобретено");
    });
}

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

GetCustomerInfo();

function GetCustomerInfo(){
    var userId = getCookie("userId");
    $.post('/getCustomerInfo', {}, function(data){
        data.forEach(function(item){
            if (item.userId == userId){
                var htmlPage = item.customerId + '<br>' + item.budget;
                $("#customerInfo").html(htmlPage);
            }
        })    
    })
}