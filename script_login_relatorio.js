let url = 'https://c372-2804-2e8-8021-2a00-5c3c-6965-ea3d-8416.ngrok-free.app'
function login(type,email,password){
    return new Promise((resolve)=>{    
        var settings = {
            "url": url + "/login",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
            },
            "data": JSON.stringify({
                "email": email,
                "password": password,
                type
            }),
        };
        
        $.ajax(settings).done(function (response) {
            if(response.authenticated){
                setCookie('user',JSON.stringify(response))
                document.location  = type == 'professor' ? 'relatorio.html' : 'index.html';
            }else{
                alert('Login invalido!');
            }
            console.log(response);
            resolve(true)
        }).catch(()=>{
                alert('Login invalido!');
            console.log(response);
            resolve(true)

        });
    })

}

function deslogar(){
    setCookie('user','')

    document.location = 'login.html';
}


function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
  function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
function checkCookie(type) {
    let user = getCookie("user");
    if(user != ""){
        return JSON.parse(user);
    }else{
        document.location = type == 'aluno' ? 'login.html' : 'login.html';
    }
}

$(document).on('click','.loginButton',function(){
    login(document.location.pathname == "/login.html" ? 'professor' : 'aluno',$('.email').val(),$('.password').val())
})

function getRelatorio(){
    return new Promise((resolve)=>{    
        let user = checkCookie('user')
        var settings = {
            "url": url + "/relatorio",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + user.authenticated.token
            },
            "data": JSON.stringify({
            }),
        };
        
        $.ajax(settings).done(function (response) {
            $("#reportContainer tbody tr").remove();

            if(response.length > 0){
                for (let index = 0; index < response.length; index++) {
                    const user_ = response[index];
                    
                    $("#reportContainer tbody").append("<tr>\
                        <td>" + user_.name + "</td>\
                        <td>" + user_.pontos + "</td>\
                        <td>" + user_.erros + "</td>\
                        <td>" + user_.movimentacao + "</td>\
                        <td>" + moment(user_.data).format('DD/MM/YYYY') + "</td>\
                    </tr>");
                }
            }
            resolve(true)
        }).catch(()=>{
            resolve(true)
        });
    })

}

if(document.location.pathname == "/relatorio.html"){
    getRelatorio();
}

function salvarQuestao(nome,codigo,pontos = 0,vida = 0,erros = 0,nivel = 0,movimentacao = 0){
    return new Promise((resolve)=>{    
        let user = checkCookie('user')
        var settings = {
            "url": url + "/salvarQuestao",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + user.authenticated.token
            },
            "data": JSON.stringify({
                nome,
                codigo,
                pontos,
                vida,
                erros,
                nivel,
                movimentacao
            }),
        };
        
        $.ajax(settings).done(function (response) {
            console.log(response);
            resolve(true)
        }).catch(()=>{
            resolve(false)
        });
    })

}