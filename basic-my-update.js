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
var h = 0;
var w = 0;
let diffx = 0;
let diffy = 0;
let mobile = false;
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

  let eye1 = { x: parseInt(width/2.6), y: parseInt(height/5), sizeX: 41, sizeY: 55, src: "./Png to svgs/Eye2-borderless.svg",};
  let eye2 = {...eye1, x: parseInt(width/1.8),  src: "./Png to svgs/Eye1-borderless.svg"};
  let nose = { x: parseInt(width/2.1), y: parseInt(height/6.9), sizeX: 35, sizeY: 93, src: "./Png to svgs/Nose-borderless1.svg", };
  let leftCorner = { x: parseInt(width/2.6), y: parseInt(height/2), sizeX: 40, sizeY: 40, src: "./icons/left-upper-corner.svg",}
  let rightCorner = { x: parseInt(width/1.8), y: parseInt(height/2), sizeX: 40, sizeY: 40, src: "./icons/right-lower-corner.svg", };

  shapesArr.push(eye1, eye2, nose, leftCorner, rightCorner);
  return drawConsole();
}

function calculateDistance() {
  let [eye1, eye2, nose, leftCorner, rightCorner] = shapesArr;
  let xdis;
  let ydis;
  if(mobile)
  {
    xdis = Math.abs((rightCorner.x+rightCorner.sizeX-5) - (leftCorner.x+5));
    ydis = Math.abs((rightCorner.y+rightCorner.sizeY-5) - (leftCorner.y+5));  
  }
  else{
    xdis = Math.abs((rightCorner.x+rightCorner.sizeX-3) - (leftCorner.x+3));
    ydis = Math.abs((rightCorner.y+rightCorner.sizeY-3) - (leftCorner.y+3));
  }
  let dis = Math.sqrt((xdis * xdis)+(ydis * ydis));
  console.log(dis, xdis, ydis);
  let pixelToMmRatio = 101.198 / dis;
  if(eye1.x > eye2.x) {
    let temp = eye1;
    eye1 = eye2;
    eye2 = temp;
  }
  console.log(leftCorner, rightCorner);
  let eye1x = eye1.x + (eye1.sizeX/2), eye2x = eye2.x + (eye2.sizeX/2);
  let noseX = nose.x + (nose.sizeX/2);
  let pupilDistance = (eye2x - eye1x) * pixelToMmRatio;
  let leftEyeDistance = (eye2x - noseX) * pixelToMmRatio;
  let rightEyeDistance = (noseX - eye1x) * pixelToMmRatio;
  let alert = document.getElementsByClassName("alert")[0];
  let alertText = document.getElementsByClassName("alertTxt")[0];
  alertText.textContent = `Pupil Distance: ${pupilDistance.toFixed(2)}mm, 
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
    newCanvas.style="touch-action: none;"
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
        width = video.width;
        height = video.height;
        w = video.style.width;
        h = video.style.height;
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
    mobile=false;
    e.preventDefault();
    e.stopPropagation();
    for(let i=0; i<shapesArr.length; i++) {
      let shape = shapesArr[i];
      if(e.offsetX>=shape.x && e.offsetX<=shape.x+shape.sizeX && e.offsetY>=shape.y && e.offsetY<=shape.y+shape.sizeY) {
        selectedShape = i;
        isDragging = true;
        diffx = e.offsetX - (shape.x);
        diffy = e.offsetY - (shape.y);
        break;
      }
    }
    return;
  });
  
  canvas.addEventListener("mousemove", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if(isDragging) {
      
      shapesArr[selectedShape].x = e.offsetX - diffx;
      shapesArr[selectedShape].y = e.offsetY - diffy;
      drawConsole();
    }
    return;
  });
  canvas.addEventListener(["mouseup"], function (e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    return selectedShape = null;
  });
  
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    e.stopPropagation();
    for(let i=0; i<shapesArr.length; i++) {
      let shape = shapesArr[i];
      if(e.offsetX>=shape.x && e.offsetX<=shape.x+shape.sizeX && e.offsetY>=shape.y && e.offsetY<=shape.y+shape.sizeY) {
        selectedShape = i;
        isDragging = true;
        diffx = e.offsetX - (shape.x);
        diffy = e.offsetY - (shape.y);
        break;
      }
    }
    return;
  });
  
  canvas.addEventListener("pointermove", function (e) {
    e.preventDefault();
    if(isDragging) {
      
      shapesArr[selectedShape].x = e.offsetX - diffx;
      shapesArr[selectedShape].y = e.offsetY - diffy;
      drawConsole();
    }
    return;
  });
  canvas.addEventListener(["pointerup"], function (e) {
    mobile = true;
    e.preventDefault();
    isDragging = false;
    return selectedShape = null;
  });
  canvas.addEventListener("pointerout", function (e) {
    e.preventDefault();
    return isDragging = false;
  });
  canvas.addEventListener("mouseout", function (e) {
    e.preventDefault();
    return isDragging = false;
  });
}
