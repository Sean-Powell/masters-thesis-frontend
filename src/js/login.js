const loginApi = 'https://q7qpd7chn7.execute-api.eu-central-1.amazonaws.com/Prod/';
const backendApi = 'https://7ztz857ez7.execute-api.eu-central-1.amazonaws.com/Prod/';

document.getElementById("submit").addEventListener("click", signIn, false);
document.getElementById("forgot-password").addEventListener("click", changePassword, false);


window.onload = function(){
    var urlParams = new URLSearchParams(window.location.search);
    var emailSent = urlParams.get('emailSent');
    var loginAgain = urlParams.get('loginAgain')

    if(loginAgain == "true"){
        document.getElementById('loginAgain').style.visibility = 'visible'
    }else{
        document.getElementById('loginAgain').style.visibility = 'hidden'
    }

    if(emailSent == "true"){
        document.getElementById('newUserCreated').style.visibility = 'visible'
    }else{
        document.getElementById('newUserCreated').style.visibility = 'hidden'
    }
}

async function signIn(){
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let payload = {
        email,
        password,
        headers: {
            "Content-Type": "application/json"
        }
    }

    let body = JSON.stringify(payload);
    await loginRequest('login', 'POST', body);
}

function loginRequest(endpoint, method, body){
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
            //check if the user has finished the survey if so send to data collection
            //else send user to survey page
            const response = JSON.parse(text);
            window.sessionStorage.setItem('AccessKey', response.AccessKey);
            window.sessionStorage.setItem('RefreshToken', response.RefreshToken);
            window.sessionStorage.setItem('IdToken', response.IdToken);
            window.sessionStorage.setItem('User', response.UUID);

            getUserInfo(response.UUID, false)
            .then(result => {
                if(result == 'false'){
                    window.location.href = '../pages/survey.html';
                }else{
                    // window.location.href = '../pages/data-collection.html';
                    window.location.href = '../pages/instructions.html';
                }
            }).catch(err =>{
                console.log('error: ' + JSON.stringify(err));
            })
        }else if(responseCode == 201){
            //password reset is required
            window.sessionStorage.setItem('session', text)
            changePassword();
        }else if(responseCode == 401){
            if(text == "Incorrect username or password"){
                const message = document.getElementById('incorrect-password-message');
                message.style.visibility = 'visible';
            }else if(text == "too many requests"){

            }
        }else{
            console.error("Something went wrong");
        }
    })
    .catch(error => {
        console.log("Backend Error: " + error.message);
    });
}

function changePassword(){
    const email = document.getElementById('email').value;
    const basePage = "../pages/change-password.html"
    let target = basePage;
    if (email !== undefined && email !== ""){
        target = target + "?email=" + email;
    }
   
    window.location.href = target;
}

async function getUserInfo(uuid, recursion=false){
    return new Promise((resovle, reject) => {
        const url = backendApi + 'survey-status?uuid=' +uuid;
        const authHeader = 'Bearer ' + window.sessionStorage.getItem('IdToken');
    
        const params = {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Authorization': authHeader
            }
        };

        fetch(url, params)
        .then(async function(response){
            const statusCode = response.status;
            const text = await response.text();

            if(statusCode == 200){
                resovle(text);
            }else{
                if(recursion === false){
                    resovle(await getUserInfo(uuid, true));
                }else{
                    resovle(undefined);
                }
            }
        }).catch(err => {
            console.log('error getting user status: ' + err);
            reject(err);
        })
    })
}

async function forgotPassword(){
    return new Promise((reject, resolve) => {

    });
}