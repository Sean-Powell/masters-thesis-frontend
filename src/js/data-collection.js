const backendApi = 'https://7ztz857ez7.execute-api.eu-central-1.amazonaws.com/Prod/';
const loginAPI = ''
const uuid = window.sessionStorage.getItem('User');
const nextImageUrl =  backendApi + "next-image?uuid=" + uuid;
const sumbitImageUrl = backendApi + "result?uuid=" + uuid;
let paused = false;
const overviewText = 'Remember to mirror where you are looking with your mouse pointer';

document.getElementById("pauseButton").addEventListener("click", pause, false);
document.getElementById("nextImage").addEventListener("click", imageCycle, false);
document.getElementById('logoutButton').addEventListener("click", logout, false);

window.onload = async function(){
    await nextImageOverlay('visible')
}

async function imageCycle(){
    return new Promise(async (resolve, reject) => {
        try{
            document.getElementById('pauseButton').style.display = 'block'
            await nextImageOverlay('hidden');
            const data = await getNextImageData();
            await displayImage(data.image);
            await displayImageCount(data.count)
            await displayOverlay(overviewText);
            const mouseData = await getMouseData();
            await submitMouseData(mouseData);
            resolve(await nextImageOverlay('visible'));
        }catch(error){
            window.sessionStorage.clear();
            window.location.href = '../pages/login.html?loginAgain=true';
        }
    });
}

function displayImageCount(imagesLeft){
    const text = imagesLeft + ' of 2000 images done'
    var contianer = document.getElementById('imagesLeft');
    contianer.innerHTML = text
    contianer.style = "color: white; font-family: 'Poppins';"
}

function getNextImageData(){
    return new Promise(async (resolve, reject) => {
        const authHeader = 'Bearer ' + window.sessionStorage.getItem('IdToken');
        const params = {
            method: "POST",
            headers: {
                'Authorization': authHeader
            }
        };
        try{
            fetch(nextImageUrl, params)
            .then(async (response) => {
                if(!response.ok){
                    window.sessionStorage.clear();
                    window.location.href = '../pages/login.html?loginAgain=true';
                }
                
                const statusCode = response.status;
                const text =  await response.text();
                const data = JSON.parse(text);
    
                if(statusCode == 200){
                    resolve(data);
                }else{
                    reject(statusCode + ' - ' + data);
                }
            })
        }catch(error){
            //TODO not catching 401 error correctly
            console.log(JSON.stringify(error));
            console.error("Something went wrong when getting the image | " + error);
            reject("Unable to get next image"); 
        };
    });
}

function displayImage(imageData){
    return new Promise((resolve, reject) => {
        var contianer = document.getElementById('image');
        contianer.innerHTML = "";

        var img = new Image();
        img.src = "data:image/jpeg;base64," + imageData;
        img.id = 'image-container';
        img.class = 'image';
        img.style.visibility = 'hidden';
        img.onload = function(){
            contianer.appendChild(img);
        }

        resolve('image displayed');
    });
}

function getMouseData(trackTime=5000){
    return new Promise((resolve, reject) => {
        console.log("starting getting mouse data");
        let mousePositions = [];
        var imageBoundingRect = document.getElementById('image-container').getBoundingClientRect();

        function handleMouseMove(event) {
            mousePositions.push({ x: event.clientX - imageBoundingRect.left, y: event.clientY - imageBoundingRect.top, t: Date.now()});
        }
    
        const startTime = Date.now();
        document.getElementById('image-container').addEventListener('mousemove', handleMouseMove);
        setTimeout(function() {
            document.getElementById('image-container').removeEventListener('mousemove', handleMouseMove);
            console.log("finished getting mouse data");

            const data = {
                startTime,
                mousePositions,
                imageBoundingRect
            }
            resolve(data);
        }, trackTime);
    });
}

function displayOverlay(text, overlayTime=1000) {
    return new Promise((resolve, reject) => {
        const overlay = document.createElement('div');  
        overlay.classList.add('overlay');
      
        const overlayText = document.createElement('p');
        overlayText.classList.add('overlay-text');
        overlayText.textContent = text;
        overlay.style.visibility = 'visible'
        overlay.style.width = '100%';
        overlay.style.height = 'auto'
        overlay.id = 'overlay'
        overlay.appendChild(overlayText);
    
        document.getElementById('container').appendChild(overlay);
        console.log('showing overlay');
        setTimeout(function() {
            document.getElementById('image-container').style.visibility = 'visible';
            overlay.style.visibility = 'hidden';
            document.getElementById('container').removeChild(document.getElementById('overlay'));
            console.log('finished display overlay');
            resolve();
        }, overlayTime);
    });
  }


function submitMouseData(mouseData){
    return new Promise((resolve, reject) => {
        const authHeader = 'Bearer ' + window.sessionStorage.getItem('IdToken');
        

        const params = {
            method: "POST",
            body: JSON.stringify(mouseData),
            headers: {
                'Authorization': authHeader
            }
        };
    
        if(paused){
            console.log('Paused did not return data!')
            return;
        }
    
        fetch(sumbitImageUrl, params)
        .then(async function(result){
            if(!result.ok){
                window.sessionStorage.clear();
                window.location.href = '../pages/login.html?loginAgain=true';
            }

            const statusCode = result.status;
            const data = await result.text();
            if(statusCode == 200){
                resolve(data);
            }else if (statusCode == 201){
                resolve(undefined)
            }else if (statusCode == 401){
                reject(statusCode);
            }
        })
    })
}

function nextImageOverlay(visibilitySetting){
    document.getElementById('nextImageOverlay').style.visibility = visibilitySetting
    const imageContainer = document.getElementById('image-container');
    if (imageContainer !== null){
        document.getElementById('image').removeChild(imageContainer);
    }   
}

async function pause(){
    if(paused == true){
        paused = false;
        await imageCycle(); //call get image as unpaused;
    }else{
        paused = true;
        document.getElementById('pauseButton').style.display = 'none';
        nextImageOverlay('visible');
    }
    console.log('Pause is now: ' + paused);
}

async function logout(){
    window.sessionStorage.clear();
    window.location.href = '../pages/login.html';
}