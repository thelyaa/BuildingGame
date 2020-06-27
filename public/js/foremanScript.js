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
    firmId = getCookie("firmId");
    var htmlPage;
    $.post("/getFirmById", {firmId: firmId}, function(data){
        htmlPage = '<h1>' + data.name + '</h1><br>';  
        
        $("#count1").text(data.inventory.materialList.material1);
        $("#count2").text(data.inventory.materialList.material2);
        $("#count3").text(data.inventory.materialList.material3);
        $("#count4").text(data.inventory.materialList.material4);
        $("#count5").text(data.inventory.materialList.material5);
        $("#count6").text(data.inventory.materialList.material6);
        $("#count7").text(data.inventory.materialList.material7);
        htmlPage += '<table>';
        htmlPage += '<th>Название проекта</th><th>Этап</th><th>Статус</th><th>Площадь</th><th>Себестоимость</th><th>Управление</th>';
        data.projects.forEach(function(item){
            htmlPage += '<tr><td>' + item.name + '</td><td>' + item.stage + '</td><td>' + item.status + '</td><td>' + item.square + '</td><td>' + item.pricePerMetre + '</td>';
            if (item.status == 0) {
                htmlPage += '<td><input type="button" value="✓" onclick="setProjectStatus('+ 1 + ',' + item.id+')"><input type="button" value="X" onclick="setProjectStatus('+ -1 + ',' + item.id+')"></td></tr>';
            }
//            if (item.status == 1) {
//                htmlPage += '<td><input type="button" value="Вырыть котлован" onclick="setProjectStatus('+ 2 + ',' + item.id+')"></td></tr>';
//            }
            if (item.status == 1) {
                htmlPage += '<td><input type="button" value="Уложить фундамент" onclick="setProjectStatus('+ 2 + ',' + item.id+')"></td></tr>';
            }
            if (item.status == 2) {
                htmlPage += '<td><input type="button" value="Построить стены" onclick="setProjectStatus('+ 3 + ',' + item.id+')"></td></tr>';
            }
            if (item.status == 3) {
                htmlPage += '<td><input type="button" value="Построить крышу" onclick="setProjectStatus('+ 4 + ',' + item.id+')"></td></tr>';
            }
            if (item.status == 4) {
                htmlPage += '<td><input type="button" value="Закончить строительство" onclick="setProjectStatus('+ 5 + ',' + item.id+')"></td></tr>';
            }
            if (item.status == 5) {
                htmlPage += '<td>Строительство окончено</td></tr>';
            }
            if (item.status == -1) {
                htmlPage += '<td>Строительство отменено</td></tr>';
            }
        });
        htmlPage += '</table>';
        $("#firmInfo").html(htmlPage);
    });  
}

GetFirmInfo();
    
function setProjectStatus(status, idProject){
    $.post('/setProjectStatus', {firmId: firmId, idProject: idProject, status: status}, function(data){
        if (status == 6) alert("строительство окончено");
        else if (data.success) alert("переход на следующий этап"); 
    });
}