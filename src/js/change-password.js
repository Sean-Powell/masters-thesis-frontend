const loginApi = 'https://q7qpd7chn7.execute-api.eu-central-1.amazonaws.com/Prod/';
document.getElementById("change-password").addEventListener("click", changePassword, false);

window.onload = function(){
    var urlParams = new URLSearchParams(window.location.search);
    var emailValue = urlParams.get('email');

    if(emailValue == undefined){
        return;
    }

    // Autofill the field
    document.getElementById('email').value = emailValue;
}

async function changePassword(){

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    if(isNullOrEmpty(password)){
        const message = document.getElementById('passwordEmpty');
        message.style.visibility = 'visible';
        return;
    }else{
        const message = document.getElementById('passwordEmpty');
        message.style.visibility = 'hidden';
    }
    
    if(isNullOrEmpty(confirmPassword)){
        const message = document.getElementById('confirmPasswordEmpty');
        message.style.visibility = 'visible';
        return;
    }else{
        const message = document.getElementById('confirmPasswordEmpty');
        message.style.visibility = 'hidden';
    }
    
    if(isNullOrEmpty(email)){
        const message = document.getElementById('emailEmpty');
        message.style.visibility = 'visible';
        return;
    }else{
        const message = document.getElementById('emailEmpty');
        message.style.visibility = 'hidden';
    }
    
    if(password !== confirmPassword){
        const message = document.getElementById('passwordsDoNotMatch');
        message.style.visibility = 'visible';
        return;
    }else{
        const message = document.getElementById('passwordsDoNotMatch');
        message.style.visibility = 'hidden';
    }

    let payload = {
        email,
        password,
        session: window.sessionStorage.getItem('session'),
        headers: {
            "Content-Type": "application/json"
        }
    }

    let body = JSON.stringify(payload);
    await loginRequest('change-password', 'POST', body);
}

function isNullOrEmpty(str) {
    return str === null || str === undefined || str.trim() === '';
}

function loginRequest(endpoint, method, body, email){
    const url = loginApi + endpoint;
    const params = {
        body,
        method
    };

    fetch(url, params)
    .then(async function(response) {
        const responseCode = response.status;
        const text = await response.text();

        if(responseCode == 200){
            const response = JSON.parse(text);
            window.sessionStorage.setItem('AccessKey', response.AccessKey);
            window.sessionStorage.setItem('RefreshToken', response.RefreshToken);
            window.sessionStorage.setItem('User', response.UUID);
            window.sessionStorage.setItem('IdToken', response.IdToken);
            window.sessionStorage.removeItem('session');
            window.location.href = "../pages/survey.html"; //can assume this is never filled out as new user
        }else{
            console.error("Something went wrong");
        }
    })
    .catch(error => {
        console.log("Backend Error: " + JSON.stringify(error));
    });
}