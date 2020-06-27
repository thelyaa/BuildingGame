function SetPrices(){
    var materialPrices = {
        material1: $("#material1").val(),
        material2: $("#material2").val(),
        material3: $("#material3").val(),
        material4: $("#material4").val(),
        material5: $("#material5").val(),
        material6: $("#material6").val(),
        material7: $("#material7").val(),
    };
    
    $.post('/setPrices', materialPrices, function(data){
        if (data.success) alert("Цены установлены");
    })
}
var statuses = ['Не рассмотрена', 'Одобрена', 'Отклонена', '' ,'Выполнена'];

function RefreshRequests(){
    var materialsName = ['Фундамент', 'Cтены', 'Крыша', 'Степлер', 'Скотч', 'Скрепки', 'Скобы для степлера'];

    $.post('/checkRequests', {}, function(data){
        var htmlTable = '<table>';
        htmlTable += '<th>Фирма</th><th>Бюджет</th><th>Материалы</th><th>Управление</th><th>Статус</th>';
        data.forEach(function(item){
            if (item.status != 3){
                htmlTable += '<tr><td>' + item.firm.name + '</td><td>' + item.price + '</td>';
                htmlTable += '<td>';
                
                for (var i = 1; i < 8; i++){
                    if (item.materials["material"+i] > 0) 
                        htmlTable += materialsName[i-1] + ':' + item.materials["material"+i] + '<br>';
                }
                htmlTable += '</td>';
                if (item.status == 1){
                    htmlTable += '<td><input type="button" value="Выдать материалы" onclick="GiveMaterials('+item.id+')"></td>'; 
                }
                else if (item.status == 2 || item.status == 4){
                    htmlTable += '<td></td>';
                }
                else {
                    htmlTable += '<td><input type="button" value="✓" onclick="ApproveRequest('+item.id+')"><input type="button" value="X" onclick="DenyRequest('+item.id+')"></td>';
                }
                    
                htmlTable += '<td>' + statuses[Number(item.status)] + '</td></tr>';
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

function GiveMaterials(id){
    $.post('/setRequestStatus', {status: 4, requestId: id}, function(data){
        if (data.success) alert("материалы выданы");
    })
}