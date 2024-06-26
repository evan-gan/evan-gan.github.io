//Utility boring stuff
const movableDiv = document.getElementById('myDiv'); //Get div!
var page = { get width() { return window.innerWidth }, get height() { return window.innerHeight } } //Page width/height
var divInfo = { get width() { return movableDiv.offsetWidth; }, get height() { return movableDiv.offsetHeight; } } //Width/height
var divPos = { x: 0, y: 0 } //Div width

function placeDiv(pos) { //Moves div to pos spesified reletive to the center of it
    movableDiv.style.position = "absolute"
    movableDiv.style.left = (pos.x - divInfo.width / 2) + 'px';
    movableDiv.style.top = (pos.y - divInfo.height / 2) + 'px';
    divPos = pos
}

//Intresting logic!

dropRandomDino(document.getElementById("dinoPic")) //Spawns inital dino!

setInterval(() => {//Updates every 10 ms
    bounceStep()
}, 10);

//Could be adjusted. 1/2 works pretty well to keep it so you can click on links
const xSpeed = 1 / 2
const ySpeed = 1 / 2

//This is used in bounce
var xDirection = 1
var yDirection = 1

function bounceStep() {
    //Inequalitys ensure the direction does not get continounsly toggled
    if (divPos.x + divInfo.width / 2 > page.width && xDirection != -1) {
        xDirection = -1
        dropRandomDino(document.getElementById("dinoPic"))
    } else if (divPos.x - divInfo.width / 2 < 0 && xDirection != 1) {
        xDirection = 1
        dropRandomDino(document.getElementById("dinoPic"))
    }
    divPos.x = xSpeed * xDirection + divPos.x

    if (divPos.y + divInfo.height / 2 > page.height && yDirection != -1) {
        yDirection = -1
        dropRandomDino(document.getElementById("dinoPic"))
    } else if (divPos.y - divInfo.height / 2 < 0 && yDirection != 1) {
        yDirection = 1
        dropRandomDino(document.getElementById("dinoPic"))
    }
    divPos.y = ySpeed * yDirection + divPos.y

    placeDiv(divPos)
}

function dropRandomDino(div) {
    const username = 'hackclub';
    const repo = 'dinosaurs';
    const path = '';
    fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`)
        .then(response => response.json())
        .then(files => {
            //Filter out non-image files (although none should be present)            
            const imageFiles = files.filter(file => file.type === 'file' && file.name.match(/\.(jpeg|jpg|png|gif)$/i));
            if (imageFiles.length > 0) {
                const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
                const imageUrl = randomImage.download_url;
                const imageElement = document.createElement('img');
                imageElement.src = imageUrl;
                imageElement.style.width = '300px';
                imageElement.style.height = '300px';

                //Add to user inputed div & make linkable
                div.innerHTML = ''; // Clear the div
                const anchorElement = document.createElement('a');
                anchorElement.href = imageUrl;
                anchorElement.target = "_blank";
                anchorElement.appendChild(imageElement);
                div.appendChild(anchorElement);
            } else {
                div.innerHTML = "<p>No image found</p>"
                console.error("No image found")
            }
        })
        .catch(error => {
            div.innerHTML = "<p>Error loading image</p>"
            console.error('Error loading images:', error);
        });
}
//Test

//Mouse pos stuff
// let mousePosition = { x: 0, y: 0 };
// document.addEventListener('mousemove', function (event) {
//     mousePosition.x = event.clientX;
//     mousePosition.y = event.clientY;
// console.log(mousePosition)
//     placeDiv(mousePosition)
// });
