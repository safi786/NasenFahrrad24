video = document.getElementById("video");
photo = document.getElementById("photo");
startbutton = document.getElementById("startbutton");
var canvas;
var context;
var streaming = false;
var width = 0;
var height = 0;
var offsetX,offsetY;
var isDragging = false;
var img = new Image();
var shapesArr = [];
var selectedShape = null;

window.onload = main();
/**********              Starting Point            ***********/
async function main() {
  // access video stream from webcam
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    video.srcObject = stream;
    addEventHandlers();
    video.play();
  } catch (DOMException) {
    let errorTextElement = document.createElement("h2");
    errorTextElement.textContent = `lhre Kamera ist nicht automatisch angegangen?
    Bitte schlieBen Sie lhre Kamera an, drucken dann diesen button und erlauben Sie der Seite die Nutzung lhrer Kamera.`;
    errorTextElement.style = video.style;
    video.parentNode.replaceChild(errorTextElement, video);

    let refreshButton = document.createElement("div");
    // refreshButton.style = startbutton.style;
    // refreshButton.textContent = "Kamera aktivieren";
    // refreshButton.addEventListener("click", async function(){
    //   await 
    //   console.log("navig");
    //   // return window.location.reload();
    //   return;
    // });
    startbutton.parentNode.replaceChild(refreshButton, startbutton);
    addEventHandlers();
  }
  return;
}

async function takepicture() {
  toggleView(false);
   
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  addCanvasEvents();
  reOffset();

  context.drawImage(video, 0, 0, width, height);
  img.src = canvas.toDataURL("image/png");

  let eye1 = { x: parseInt(width/2.3), y: parseInt(height/5), sizeX: 40, sizeY: 55, src: "./Png to svgs/Eye2-borderless.svg",};
  let eye2 = {...eye1, x: parseInt(width/1.5),  src: "./Png to svgs/Eye1-borderless.svg"};
  let nose = { x: parseInt(width/1.86), y: parseInt(height/4.5), sizeX: 45, sizeY: 80, src: "./Png to svgs/Nose-borderless1.svg", };
  let rightCorner = { x: parseInt(width/2.2), y: parseInt(height/2), sizeX: 40, sizeY: 40, src: "./icons/leftCorner.svg",}
  let leftCorner = { x: parseInt(width/1.5), y: parseInt(height/2), sizeX: 40, sizeY: 40, src: "./icons/rightCorner.svg", };

  shapesArr.push(eye1, eye2, nose, leftCorner, rightCorner);
  return drawConsole();
}

function calculateDistance() {
  let [eye1, eye2, nose, leftCorner, rightCorner] = shapesArr;
  let pixelToMmRatio = 85.6 / Math.abs((leftCorner.x+leftCorner.sizeX) - rightCorner.x);
  if(eye1.x > eye2.x) {
    let temp = eye1;
    eye1 = eye2;
    eye2 = temp;
  }
  let eye1x = eye1.x + eye1.sizeX/4, eye2x = eye2.x + eye2.sizeX;
  let noseX = nose.x + (nose.sizeX/2);
  let pupilDistance = (eye2x - eye1x + 5) * pixelToMmRatio;
  let leftEyeDistance = (eye2x - noseX) * pixelToMmRatio;
  let rightEyeDistance = (noseX - eye1x) * pixelToMmRatio;
  let alert = document.getElementsByClassName("alert")[0];
  let alertText = document.getElementsByClassName("alertTxt")[0];
  alertText.textContent = `Pupillendistanz: ${pupilDistance.toFixed(2)}mm, 
  Left Eye-Nose Distance: ${leftEyeDistance.toFixed(2)}mm,     
  Right Eye-Nose Distance: ${rightEyeDistance.toFixed(2)}mm.`;
  let closeBtn = document.getElementsByClassName("closebtn")[0];
  closeBtn.addEventListener("click", function() {
    this.parentElement.style.display="none";
  });
  alert.style.display = "block";
}

function toggleView(isCamera) {
  document.getElementsByClassName("camera")[0].style.display = isCamera ? "block" : "none";
  document.getElementsByClassName("calculate")[0].style.display = isCamera ? "none" : "block";
  if(isCamera) {
    let newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    newCanvas.id = "canvas";
    delete canvas;
    img = new Image();
    canvas.parentNode.replaceChild(newCanvas, canvas);
    shapesArr = [];
  }
  return;
}

async function drawConsole() {
  context.drawImage(img, 0, 0, width, height);
  for(let shape of shapesArr) {
    setPointers(shape);
  }
  return;
}

function setPointers(shape) {
  let pointer = new Image();
  pointer.onload = function () {
    context.drawImage(pointer, shape.x, shape.y, shape.sizeX, shape.sizeY);
  };
  return pointer.src = shape.src;
}

function reOffset(){
  var BB=canvas.getBoundingClientRect();
  offsetX=BB.left;
  return offsetY=BB.top;        
}

     /************            Add Event handlers in html elements        ************/
function addEventHandlers() {
  function next(isNext) {
    document.getElementsByClassName("instructions")[0].style.display = isNext ? "none" : "block";
    document.getElementsByClassName("camera")[0].style.display = isNext ? "block" : "none";
  }
  $("#next").click(function(){
    return next(true);
  });
  $("#backToInst").click(function(){
    return next(false);
  });
  startbutton.addEventListener(
    "click",
    function (ev) {
      takepicture();
      ev.preventDefault();
      ev.stopPropagation();
    },
    false
  );
  $("#back").click(function(e) {
    toggleView(true);
  });
  $("#distance").click(function(e) {
    calculateDistance();
  });
  return video.addEventListener(
    "canplay",
    function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if(!streaming) {
        width = video.videoWidth / 1.2;
        height = video.videoHeight / 1.2;
        video.width = width;
        video.height = height;
        streaming = true;
      }
    },
    false
  );
}

function addCanvasEvents() {
  canvas.addEventListener("mousedown", function (e) {
    e.preventDefault();
    e.stopPropagation();
    for(let i=0; i<shapesArr.length; i++) {
      let shape = shapesArr[i];
      if(e.offsetX>=shape.x && e.offsetX<=shape.x+shape.sizeX && e.offsetY>=shape.y && e.offsetY<=shape.y+shape.sizeY) {
        selectedShape = i;
        isDragging = true;
        break;
      }
    }
    return;
  });
  
  canvas.addEventListener("mousemove", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if(isDragging) {
      shapesArr[selectedShape].x = e.offsetX - (shapesArr[selectedShape].sizeX/2)+10;
      shapesArr[selectedShape].y = e.offsetY - (shapesArr[selectedShape].sizeY/2)+ 20;
      drawConsole();
    }
    return;
  });
  
  canvas.addEventListener("mouseup", function (e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    return selectedShape = null;
  });
  
  canvas.addEventListener("mouseout", function (e) {
    e.preventDefault();
    e.stopPropagation();
    return isDragging = false;
  });
}
