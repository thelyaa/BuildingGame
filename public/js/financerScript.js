function GetRequest(){
    $.post('/checkRequests', {}, function(data){
        var htmlTable = '<table>';
        htmlTable += '<th>Фирма</th><th>Бюджет</th><th>Материал 1</th><th>Материал 2</th><th>Материал 3</th><th>Управление</th>';
        data.forEach(function(item){
            console.log(item);
            if (item.status == 3) {
                htmlTable += '<tr><td>' + item.firm.name + '</td><td>' + item.price + '</td><td>' + item.materials.material1 + '</td><td>' + item.materials.material2 + '</td><td>' + item.materials.material3 + '</td>';
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