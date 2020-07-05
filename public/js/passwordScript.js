function EnterToGame(){
    $.post('/auth', {pass: $("#password").val()}, function(data){
        if (data.success)
            window.location.href = "/" + data.nextPage; 
    });
}