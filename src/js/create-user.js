const loginApi = 'https://q7qpd7chn7.execute-api.eu-central-1.amazonaws.com/Prod/';

document.getElementById("create-account").addEventListener("click", createUser, false);

function createUser(){
    let email = document.getElementById('email').value;
    const body = {}
    const reponse = loginRequest(email, "POST", body);
}

function loginRequest(email, method, body){
    document.getElementById('user-already-exists').style.visibility = 'hidden';
    document.getElementById('no-email').style.visibility = 'hidden';

    const url = loginApi + 'user?email=' + email;
    const params = {
        body,
        method
    };

    fetch(url, params)
    .then(async function(response){
        if(!response.ok){
            if(response.status == 400){
                var message = await response.text();
                if(message === "User Already Exists"){
                    document.getElementById('user-already-exists').style.visibility = 'visible';
                }else if(message === "No email was provided"){
                    document.getElementById('no-email').style.visibility = 'visible';
                }
            }
        }

        if(response.status == 200){
            window.location.href = '../pages/login.html?emailSent=true';
        }
    })
    .catch(error => console.error(error))
}
