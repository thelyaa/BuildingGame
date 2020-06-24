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
