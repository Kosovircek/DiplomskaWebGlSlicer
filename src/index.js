
import CanvasHelper from "./canvasHelper.js";
import vertexShader from "../shaders/vertexShaderTut.js";
import fragmentShader from "../shaders/fragmentShaderTut.js";
import vertexShaderColor from "../shaders/vertexShaderColor.js";
import fragmentShaderColor from "../shaders/fragmentShaderColor.js";

import ObjLoader from "./objLoader.js";

import saveAs from "../lib/FileSaver.js";




var helper = new CanvasHelper("myCanvas", vertexShader, fragmentShader, vertexShaderColor, fragmentShaderColor);
helper.setSize(document.body.clientWidth, document.body.clientHeight);




var lcd = `
# Blender v2.79 (sub 0) OBJ File: ''
# www.blender.org
o Plane
v -98.000000 -0.000001 98.000000
v 98.000000 -0.000001 98.000000
v -98.000000 -0.000001 -98.000000
v 98.000000 -0.000001 -98.000000
vt 0.999900 0.000100
vt 0.000100 0.999900
vt 0.000100 0.000100
vt 0.999900 0.999900
vn 0.0000 1.0000 0.0000
s off
f 2/1/1 3/2/1 1/3/1
f 2/1/1 4/4/1 3/2/1

`;

var models = [];

//var loader = new ObjLoader(file);
//var loaderPlane = new ObjLoader(plane);
//var loaderCube = new ObjLoader(cube);
var loaderLcd = new ObjLoader(lcd);
//var sliceRectLoader = new ObjLoader();


//helper.addModel(positions, indices, textureCoordinates, vertexNormals, "./models/texFire.png");
//helper.addModel(loaderCube.orderedVertecies, loaderCube.indecies, loaderCube.orderedUvs, loaderCube.orderedNormals, "./models/test.png");
//helper.setSliceRect(loaderPlane.orderedVertecies, loaderPlane.indecies, loaderPlane.orderedUvs, loaderPlane.orderedNormals, "./models/test.png");
helper.addModel(loaderLcd.orderedVertecies, loaderLcd.indecies, loaderLcd.orderedUvs, loaderLcd.orderedNormals, "./models/texFire.png");

helper.setSliceRect(loaderLcd.orderedVertecies, loaderLcd.indecies, loaderLcd.orderedUvs, loaderLcd.orderedNormals, "./models/test.png");
//helper.addModel(loaderPlane.orderedVertecies, loaderPlane.indecies, loaderPlane.orderedUvs, loaderPlane.orderedNormals, "./models/test.png");


//helper.rotate([0.2, 0.0, 0.0]);
//helper.renderToTexture();
//helper.rotate(0.4, [1, 0, 0]);


var then = 0;
/*
// Draw the scene repeatedly
function render(now) {
	now *= 0.001;  // convert to seconds
	const deltaTime = now - then;
	then = now;

	helper.renderToTexture();
		
	requestAnimationFrame(render);
}
requestAnimationFrame(render);
*/

helper.renderToTexture();

//TODO(): someting wrong with resizing, probs not right to call it on body
function onResize(){
	console.log("Window has resized");
	helper.setSize(document.body.clientWidth, document.body.clientHeight);
	helper.draw();
}
window.onresize = onResize;
	

//rotate the view
helper.rotateCamera(0.005*30, [1, 0, 0]);
helper.draw();
helper.renderToTexture();
	
//Mouse events
var mousePosOld;
var mousePosNew;
var mouseDown = false;
var mouseButton = 0;
	
$(document).ready(function(){	

	$("body").on('mousedown', function (evt){
		mouseDown = true;
		mousePosOld = { x: evt.pageX, y: evt.pageY };
		mousePosNew = { x: evt.pageX, y: evt.pageY };

		mouseButton = evt.which;
		
		helper.rayCastClick(evt.pageX, evt.pageY, $("#myCanvas").width(), $("#myCanvas").height());
		
	});
	$("body").on('mousemove', function (evt){
		helper.renderToTexture();
		if(mouseDown){
		
			var mousePosTemp = { x: evt.pageX, y: evt.pageY };
			var mouseMovement = { x: mousePosOld.x - mousePosTemp.x, y: mousePosOld.y - mousePosTemp.y};
		
			if(mouseButton == 1){
				
				helper.rotateCamera(-0.005*mouseMovement.x, [0, 1, 0]);
				helper.rotateCamera(-0.005*mouseMovement.y, [1, 0, 0]);
				
			}else if(mouseButton == 3){
				helper.moveModels([0.05*mouseMovement.x, 0, 0.05*mouseMovement.y]);
				
				
			}else if(mouseButton == 2){
				helper.moveCamera([-0.05*mouseMovement.x, -0, -0.05*mouseMovement.y]);
			}
			
			mousePosOld = mousePosNew;
			mousePosNew = { x: evt.pageX, y: evt.pageY };
		}
	
	});
	$("body").on('mouseup', function (evt){
		mouseDown = false;
		mouseButton = 0;
	});


});


$(window).bind('mousewheel DOMMouseScroll', function(event){
	if(!mouseDown){
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
			helper.zoomCamera([1.05, 1.05, 1.05]);
		}
		else {
			helper.zoomCamera([0.95, 0.95, 0.95]);
		}
	}
});



var globalPrintResolution = 0.1;
var globalI = 0;
var globalEnd = 0;


// Draw the scene repeatedly
function renderTest(now) {
	now *= 0.001;  // convert to seconds
	const deltaTime = now - then;
	then = now;

	helper.renderFrameAndSaveTexture(globalPrintResolution);
		
	globalI += 1;	
	if(globalI <= 1000){	
		requestAnimationFrame(renderTest);
	}else{
		helper.endSaveFileAndSave();
	}
}
//requestAnimationFrame(render);


var btnSave = document.getElementById("testSave");
btnSave.onclick = function(){
	
	var printResolution = document.getElementById("moveSliceRectInput").value;
	
	var printHeight = helper.initSaveFile();
	
	
	document.getElementById("loadingGif").style.visibility = "visible";

	setTimeout(function() {
		
		for(var i=0; i <= printHeight+parseFloat(printResolution)*2; i+= parseFloat(printResolution) ){
			console.log( "test: " + i + " <= " + (printHeight+parseFloat(printResolution)*2) );
			helper.renderFrameAndSaveTexture(printResolution);
		}

		document.getElementById("loadingGif").style.visibility = "hidden";

		globalPrintResolution = printResolution;
		globalEnd = printHeight+parseFloat(printResolution)*2;
		
		//requestAnimationFrame(renderTest);
		
		
		helper.endSaveFileAndSave();

	}, 50);
		
	
	
};

var moveSliceRect = document.getElementById("moveSliceRect");
moveSliceRect.onclick = function(){
	
	var moveSliceRectInput = document.getElementById("moveSliceRectInput");
		
	helper.debugRepositionSliceRect(moveSliceRectInput.value*0.1);
	
};
document.getElementById("moveSliceRectDown").onclick = function(){
	
	var moveSliceRectInput = document.getElementById("moveSliceRectInput");
		
	helper.debugRepositionSliceRect(moveSliceRectInput.value*(-0.1));
	
};

$("#myfile").on("change", function (changeEvent) {
  for (var i = 0; i < changeEvent.target.files.length; ++i) {
    (function (file) {               // Wrap current file in a closure.
      var loader = new FileReader();
      loader.onload = function (loadEvent) {
        if (loadEvent.target.readyState != 2)
          return;
        if (loadEvent.target.error) {
          alert("Error while reading file " + file.name + ": " + loadEvent.target.error);
          return;
        }
       
		// Your text is in loadEvent.target.result
		
		var tempModel = new ObjLoader(loadEvent.target.result);
		//helper.addModel(tempModel.orderedVertecies, tempModel.indecies, tempModel.orderedUvs, tempModel.orderedNormals, "./models/test.png");
		helper.addModelColor(tempModel.orderedVertecies, tempModel.indecies, tempModel.orderedUvs, tempModel.orderedNormals, "./models/test.png");
		//models.push(tempModel);
		
		helper.rotateCamera(0.005*30, [1, 0, 0]);
		helper.draw();
		helper.renderToTexture();
		
      };
      loader.readAsText(file);
    })(changeEvent.target.files[i]);
  }
});











