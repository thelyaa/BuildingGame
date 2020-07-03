function EnterToGame(){
    $.post('/auth', {pass: $("#password").val()}, function(data){
       window.location.href = "/" + data.nextPage; 
    });
}