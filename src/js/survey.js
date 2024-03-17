const backendApi = 'https://7ztz857ez7.execute-api.eu-central-1.amazonaws.com/Prod/';
document.getElementById("submit").addEventListener("click", submit, false);

let otherBool = false;

function submit(){
    var gender = document.getElementById("gender").value;
    var age = document.getElementById("age").value;
    var doYouHaveVisualImpairment = document.getElementById("doYouHaveVisualImpairment").value;
    var visualImpairmentType = [];

    if (doYouHaveVisualImpairment === "Yes") {
        var nearsightedInput = document.getElementById('nearsighted').checked;
        var farsightedInput = document.getElementById('farsighted').checked;
        var presbyopiaInput = document.getElementById('presbyopia').checked;
        var astigmatismInput = document.getElementById('astigmatism').checked;
        var diabeticRetinoInput = document.getElementById('diabeticRetino').checked;
        var AMDInput = document.getElementById('AMD').checked;
        var glaucomaInput = document.getElementById('glaucoma').checked;
        var cataractInput = document.getElementById('cataract').checked;
        var colourBlindnessInput = document.getElementById('colourBlindness').checked;
        
        visualImpairmentType.push(nearsightedInput);
        visualImpairmentType.push(farsightedInput);
        visualImpairmentType.push(presbyopiaInput);
        visualImpairmentType.push(astigmatismInput);
        visualImpairmentType.push(diabeticRetinoInput);
        visualImpairmentType.push(AMDInput);
        visualImpairmentType.push(glaucomaInput);
        visualImpairmentType.push(cataractInput);
        visualImpairmentType.push(colourBlindnessInput);
        
        if(document.getElementById('other').checked === true){
            var otherInput = document.getElementById('otherText').value;
            visualImpairmentType.push(otherInput);
        }else{
            visualImpairmentType.push("");
        }
        
    }

    //TODO check that form is filled out with needed details

    var formData = {
        "gender": gender,
        "age": age,
        "doYouHaveVisualImpairment": doYouHaveVisualImpairment,
        "visualImpairmentType": visualImpairmentType,
    };

    const body = JSON.stringify(formData);
    const authHeader = 'Bearer ' + window.sessionStorage.getItem('IdToken');
    const uuid = window.sessionStorage.getItem("User");
    const url = backendApi + "survey-result?uuid=" + uuid
    const parmas = {
        method: "POST",
        body,
        headers: {
            'Authorization': authHeader
        }
    }

    fetch(url, parmas)
    .then(function(result){
        const statusCode = result.status;
        if(statusCode != 200){
            console.log("Failed to save result!");
        }else{
            window.location.href = "../pages/instructions.html"
        }
    });
}

function otherClicked(){
    if(otherBool === true){
        otherBool = false;
        document.getElementById('otherText').style.visibility = 'hidden';
    }else{
        otherBool = true;
        document.getElementById('otherText').style.visibility = 'visible';
    }
}