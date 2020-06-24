function SetPrices(){
    var materialPrices = {
        material1: $("#material1").val(),
        material2: $("#material2").val(),
        material3: $("#material3").val(),
    };
    
    $.post('/setPrices', materialPrices, function(data){
        if (data.success) alert("Цены установлены");
    })
}
var statuses =['Не рассмотрена', 'Одобрена', 'Отклонена'];

function RefreshRequests(){
    $.post('/checkRequests', {}, function(data){
        var htmlTable = '<table>';
        htmlTable += '<th>Фирма</th><th>Бюджет</th><th>Материал 1</th><th>Материал 2</th><th>Материал 3</th><th>Управление</th><th>Статус</th>';
        data.forEach(function(item){
            if (item.status != 3){
                htmlTable += '<tr><td>' + item.firm.name + '</td><td>' + item.price + '</td><td>' + item.materials.material1 + '</td><td>' + item.materials.material2 + '</td><td>' + item.materials.material3 + '</td>';
                htmlTable += '<td><input type="button" value="✓" onclick="ApproveRequest('+item.id+')"><input type="button" value="X" onclick="DenyRequest('+item.id+')"></td><td>' + statuses[item.status] + '</td></tr>';
            }
        });
        htmlTable += '</table>';
        $("#requests").html(htmlTable);
    });
}

function ApproveRequest(id){
    $.post('/setRequestStatus', {status: 1, requestId: id}, function(data){
        if (data.success) alert("заявка одобрена");
    });
    
}

function DenyRequest(id){
    $.post('/setRequestStatus', {status: 2, requestId: id}, function(data){
        if (data.success) alert("заявка отклонена");
    })
}