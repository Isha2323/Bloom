const canvas = document.getElementById("canvas");
const body = document.querySelector("body");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
//canvas.width = 500; //to set the specefic area
//canvas.height = 500;

var thecolor = ""; //background color
let prevX = null;
let prevY = null;
let lineWidth = 1;
let draw = false;

function setCanvasBackgroundColor(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//function to change the background color
body.style.backgroundColor = "#FFFFFF";
var theInput = document.getElementById("favcolor");

theInput.addEventListener(
  "input",
  function () {
    thecolor = theInput.value;
    body.style.backgroundColor = thecolor;
    setCanvasBackgroundColor(thecolor);
  },
  false
);
//...end
const ctx = canvas.getContext("2d");
ctx.lineWidth = lineWidth;
//line color
var lineInput = document.getElementById("stroke");
lineInput.addEventListener("change", (e) => {
  thestroke = lineInput.value;
  ctx.strokeStyle = thestroke;
});

var lw = document.getElementById("linewidth");
lw.addEventListener("change", (e) => {
  thelw = lw.value;
  ctx.lineWidth = thelw;
});

//clear button
let clr = document.querySelectorAll(".clr");
clr = Array.from(clr);
clr.forEach((clr) => {
  clr.addEventListener("click", () => {
    ctx.strokeStyle = clr.dataset.clr;
  });
});

let clrbtn = document.querySelector(".clear");
clrbtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackgroundColor(thecolor);
});

//save button
let sbtn = document.querySelector(".save");
sbtn.addEventListener("click", () => {
  let data = canvas.toDataURL("img/png");
  let a = document.createElement("a");
  a.href = data;
  a.download = "sketch.png";
  a.click();
});

//canvas

window.addEventListener("mousedown", (e) => (draw = true));
window.addEventListener("mouseup", (e) => (draw = false));

window.addEventListener("mousemove", (e) => {
  if (prevX == null || prevY == null || !draw) {
    prevX = e.clientX;
    prevY = e.clientY;
    return;
  }

  let currentX = e.clientX;
  let currentY = e.clientY;

  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currentX, currentY);
  ctx.stroke();
  prevX = currentX;
  prevY = currentY;
});
