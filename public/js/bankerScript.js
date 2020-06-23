function Update(){
    
    $.post("/getFirmList", {}, function(returnedData){
        console.log(returnedData);
        MakeTable(returnedData);
    })
}

Update();

function MakeTable(data){
    var htmlTable = '<table>';
    htmlTable += '<th>name</th><th>give money</th><th>dolg</th>';
    data.forEach(function(item){
        htmlTable += '<tr><td>' + item.name + '</td>' + '<td>' + '<input type="button" onclick="GiveMoney(' + item.firmId + ')" value="Выдать деньги">' 
            + '</td>' + '<td>' + item.debt + '</td></tr>';
    });
    htmlTable += '</table>';
    $("#main").html(htmlTable);
}

function GiveMoney(id){
    var money = prompt("скока деняк?");
    console.log(money);
    
    $.post('/giveMoneyToFirm', {firmId: id, value: Number(money)});
    Update();
}
