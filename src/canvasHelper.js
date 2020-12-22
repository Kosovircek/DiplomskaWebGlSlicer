import Model from "./glModel.js";
import ModelColor from "./glModelColor.js";
import RenderSaver from "./renderSaver.js";

import vertexShader from "../shaders/vertexShaderTut.js";
import fragmentShader from "../shaders/fragmentShaderTut.js";

import vertexShaderSlice from "../shaders/vertexShaderSlice.js";
import fragmentShaderSlice from "../shaders/framgnetShaderSlice.js";


import saveAs from "../lib/FileSaver.js";


class CanvasHelper{
	
	
	constructor(canvasId, vSource, fSource, vSourceColor, fSourceColor){
		
		this.canvas = document.getElementById(canvasId);
		this.gl = this.canvas.getContext("webgl");
		//this.gl = this.canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
		
		// Only continue if WebGL is available and working
		if (!this.gl) {
			alert("Unable to initialize WebGL. Your browser or machine may not support it.");
			return;
		}
		
		
		//Progam for user rendering with texture
		this.shaderProgram = this.initShaderProgram(vSource, fSource);
		this.programInfo = {
			
			program: this.shaderProgram,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition"),
				textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
				vertexNormal: this.gl.getAttribLocation(this.shaderProgram, 'aVertexNormal'),
			},
			unifromLocations: {
				modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
				projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
				normalMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uNormalMatrix'),
				cameraMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uCameraMatrix'),
				uSampler: this.gl.getUniformLocation(this.shaderProgram, 'uSampler'),
			}
		}
		
		//Program for rendering with color only
		this.shaderProgramColor = this.initShaderProgram(vSourceColor, fSourceColor);
		this.programInfoColor = {
			
			program: this.shaderProgramColor,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(this.shaderProgramColor, "aVertexPosition"),
				textureCoord: this.gl.getAttribLocation(this.shaderProgramColor, 'aTextureCoord'),
				vertexNormal: this.gl.getAttribLocation(this.shaderProgramColor, 'aVertexNormal'),
			},
			unifromLocations: {
				modelViewMatrix: this.gl.getUniformLocation(this.shaderProgramColor, 'uModelViewMatrix'),
				projectionMatrix: this.gl.getUniformLocation(this.shaderProgramColor, 'uProjectionMatrix'),
				normalMatrix: this.gl.getUniformLocation(this.shaderProgramColor, 'uNormalMatrix'),
				cameraMatrix: this.gl.getUniformLocation(this.shaderProgramColor, 'uCameraMatrix'),
				color: this.gl.getUniformLocation(this.shaderProgramColor, 'uColor'),
			}
		}
		
		console.log("veretexShader: "+vertexShaderSlice);
		console.log("fragmentShader: "+fragmentShaderSlice);
		//Program for rendering slice 
		this.shaderProgramSlice = this.initShaderProgram(vertexShaderSlice, fragmentShaderSlice);
		this.programInfoSlice = {
			
			program : this.shaderProgramSlice,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(this.shaderProgramSlice, "aVertexPosition")
			},
			uniformLocations: {
				modelViewMatrix: this.gl.getUniformLocation(this.shaderProgramSlice, "uModelViewMatrix"),
				projectionMatrix: this.gl.getUniformLocation(this.shaderProgramSlice, "uProjectionMatrix")
			}
			
		}
		
		
		this.models = new Array();
		
		this.renderSaver = new RenderSaver(this.gl);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		
		this.sliceRect;
		
		this.saveFile;
		this.printTop = 0;
		
		this.selectedModel = null;
		
		this.printHeight = 0;
		this.layerNum = 0;
		this.layerHeight = 0;
	}
	
	
	
	initShaderProgram(veSource, frSource){
		
		const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, veSource);
		const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, frSource);
		
		const shaderProgram = this.gl.createProgram();
		this.gl.attachShader(shaderProgram, vertexShader);
		this.gl.attachShader(shaderProgram, fragmentShader);
		this.gl.linkProgram(shaderProgram);
		
		if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
			alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
			return null;
		}
		
		return shaderProgram;
	}
	
	loadShader(type, source){
		
		const shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
			this.gl.deleteShader(shader);
			return null;
		}
		
		return shader;
	}
	
	
	draw(){
		/*
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		
		
		this.gl.clear(this.gl.COLOR_BUFFER_BIT, this.gl.DEPTH_BUFFER_BIT);
		
		
		for(var i=0; i < this.models.length; i++){
			this.models[i].draw();
		}
		*/
	}
	
	renderToTexture(){
		
		
			//RENDER TO TEXTURE THE SLICE RENDER
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.disable(this.gl.BLEND);
			
		
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderSaver.frameBuffer);
						
			this.gl.viewport(0, 0, this.renderSaver.width, this.renderSaver.heigth);
			
			this.gl.clearColor(1.0, 0.0, 0.0, 0.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

			
			for(var i=1; i < this.models.length; i++){
				
				this.models[i].drawForSlice();
			}
			
			
			
			//RENDER NORMAL VIEW OF OBJECTS
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.disable(this.gl.BLEND);
			
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			
			this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
			
			this.gl.clearColor(0.0, 0.7, 1.0, 1.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			
			
			for(var i=1; i < this.models.length; i++){
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.models[i].texture);
				this.models[i].draw();
			}
			//Render the lcd
			this.gl.enable(this.gl.BLEND);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.models[0].texture);
			this.models[0].draw();
			
			
			//RENDER SLICE TEXTURE TO RECT INFRON OF EVERYTHING
			this.gl.disable(this.gl.DEPTH_TEST);
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
			this.gl.enable(this.gl.BLEND);
			
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderSaver.texture);
			//this.gl.bindTexture(this.gl.TEXTURE_2D, this.sliceRect.texture);
			
			this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

			//this.sliceRect.rotate();
			this.sliceRect.draw();
			
			
			
			
	}
	
	
	renderFrameAndSaveTexture(sliceMoveZ){
		
		console.log("renderFrameAndSaveTexture START");
		
		//RENDER TO TEXTURE THE SLICE RENDER
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.disable(this.gl.BLEND);
			
		
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderSaver.frameBuffer);
						
			this.gl.viewport(0, 0, this.renderSaver.width, this.renderSaver.heigth);
			
			//this.gl.clearColor(1.0, 0.0, 0.0, 0.7);
			this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			
		
			//Move sliceLayer (models and sliceRect)
			var zMove = parseFloat(sliceMoveZ)/100.95;
			//console.log("zMove: "+zMove);
			for(var i=1; i < this.models.length; i++){
				this.models[i].translateSlice(-1*zMove);
				this.models[i].drawForSlice();
			}
			this.models[0].translateSlice(-1*zMove);
			this.sliceRect.translate([0, zMove/0.01012, 0]);
			
			
			
			//DEBUG FRAMBUFFER TO IMG TAG
			//this.createImageFromTexture(this.gl, 1024, 1024);
			
			
			//SAVE SLICE TO IMG
			var pixels = new Uint8Array(480 * 854 *4);
			//this.gl.readPixels(0, 0,854, 480, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
			//this.gl.readPixels(85, 272,854+85, 480+272, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
			this.gl.readPixels(85, 272,854, 480, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
		
			//normalize vlaues for each pixel
			var normalizedPixels = new Uint8Array(480 * 854);		
			for(var i=0; i<(pixels.length-1); i+=4){
								
				var j = i/4;
				
				if(pixels[i] == 0){
					normalizedPixels[j] = 0x00;
				}else{
					normalizedPixels[j] = 0x01;
				}
			}
			
			//Transpose the buffer
			var transposedNormalizedPixels = new Uint8Array(480 * 854);
			var transposedIndex = 0;
			for(var x = 0; x < 854; x++){
				
				for(var y = x; y < 480*854; y += 854){
					
					//console.log("t:"+transposedIndex+" n:"+y+" v:"+normalizedPixels[y]);
					transposedNormalizedPixels[transposedIndex] = normalizedPixels[y];
					transposedIndex++;
				}
				
			}
			normalizedPixels = transposedNormalizedPixels; //Just so i didn't need to rename
			
			
			//Compress 8 pixels into a single byte (it is little indian i think)
			var reducedPixels = new Uint8Array((480 * 854)/8);
			for(var i=0; i<(normalizedPixels.length-1); i+=8){
				
				//Get 8 pixels
				var b1 = normalizedPixels[i];
				var b2 = normalizedPixels[i+1];
				var b3 = normalizedPixels[i+2];
				var b4 = normalizedPixels[i+3];
				var b5 = normalizedPixels[i+4];
				var b6 = normalizedPixels[i+5];
				var b7 = normalizedPixels[i+6];
				var b8 = normalizedPixels[i+7];
				
				var j = i/8; //reducedPixels is 8 times smaller
				
				//Left shift the bits to that the create a byte
				reducedPixels[j] = b1 | (b2 << 1) | (b3 << 2) | (b4 << 3) | (b5 << 4) | (b6 << 5) | (b7 << 6) | (b8 << 7)
				
			}
		
			/*
			//G-code at the beginning and end 
			var start = new Uint8Array([0x47 ,0x32 ,0x31 ,0x3B ,0x0A ,0x47 ,0x39 ,0x31 ,0x3B ,0x0A ,0x4D ,0x31 ,0x37 ,0x3B ,0x0A ,0x4D ,0x31 ,0x30 ,0x36 ,0x20 ,0x53 ,0x30 ,0x3B ,0x0A ,0x47 ,0x32 ,0x38 ,0x20 ,0x5A ,0x30 ,0x3B ,0x0A ,0x3B ,0x57 ,0x3A ,0x34 ,0x38 ,0x30 ,0x3B ,0x0A ,0x3B ,0x48 ,0x3A ,0x38 ,0x35 ,0x34 ,0x3B ,0x0A ,0x3B ,0x4C ,0x3A ,0x31 ,0x3B ,0x0A ,0x4D ,0x31 ,0x30 ,0x36 ,0x20 ,0x53 ,0x30 ,0x3B ,0x0A ,0x47 ,0x31 ,0x20 ,0x5A ,0x31 ,0x30 ,0x20 ,0x46 ,0x35 ,0x30 ,0x3B ,0x0A ,0x47 ,0x31 ,0x20 ,0x5A ,0x2D ,0x39 ,0x2E ,0x39 ,0x37 ,0x35 ,0x20 ,0x46 ,0x31 ,0x35 ,0x30 ,0x3B ,0x0A ,0x7B ,0x7B, 0x0A]);
			var end = new Uint8Array([0x0A, 0x7D ,0x7D ,0x0A ,0x4D ,0x31 ,0x30 ,0x36 ,0x20 ,0x53 ,0x32 ,0x35 ,0x35 ,0x3B ,0x0A ,0x47 ,0x34 ,0x20 ,0x53 ,0x32 ,0x35 ,0x3B, 0x0A]);
			//Stich G-code and pixel data together
			var a1 = new Uint8Array(start.length + reducedPixels.length);
			a1.set(start);
			a1.set(reducedPixels, start.length);
			var together = new Uint8Array(a1.length + end.length);
			together.set(a1);
			together.set(end, a1.length);
		
			//Make a donwloadeble file and save it
			var blob = new Blob([together], {type: "application/octet-stream"});
			var fileName = "testFlieSaver.wow";
			saveAs(blob, fileName);
			*/
			this.addNewSliceLayerToSaveFile(reducedPixels, sliceMoveZ);
			
			
			
			
			//RENDER NORMAL VIEW OF OBJECTS
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.disable(this.gl.BLEND);
			
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			
			this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
			
			this.gl.clearColor(0.0, 0.7, 1.0, 1.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			
			
			for(var i=0; i < this.models.length; i++){
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.models[i].texture);
				this.models[i].draw();
			}
			
			
			
			//RENDER SLICE TEXTURE TO RECT INFRON OF EVERYTHING
			this.gl.disable(this.gl.DEPTH_TEST);
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
			this.gl.enable(this.gl.BLEND);
			
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderSaver.texture);
			//this.gl.bindTexture(this.gl.TEXTURE_2D, this.sliceRect.texture);
			
			this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

			//this.sliceRect.rotate();
			this.sliceRect.draw();
			
			
		
			console.log("renderFrameAndSaveTexture END");
		
	}
	

	
	setSize(width, height){
		
		this.canvas.width = width;
		this.canvas.height = height;
		
		console.log(this.gl.canvas.clientWidth);
		console.log(this.gl.canvas.clientHeight);
		
		
	}
	
	
	
	addModel(positions, indices, textureCoordinates, vertexNormals, textureUrl){
		
		
		var model = new Model(this.gl, this.programInfoSlice, this.programInfo, positions, indices, textureCoordinates, vertexNormals, textureUrl, true);
		//var model = new ModelColor(this.gl, this.programInfoSlice, this.programInfoColor, positions, indices, vertexNormals);
		
		if(this.models.length >= 1){
			model.matchLcdCamera(this.models[0].getCameraMatrix(), this.models[0].lcdNormalsMatrix(), this.models[0].getRotation(), this.models[0].getCameraLcdPlaneRotation());
		}
		
		this.models.push(model);
		
		
		/*
		var model = new Model(this.gl, this.programInfoSlice, this.programInfo, positions, indices, textureCoordinates, vertexNormals, textureUrl);
		
		if(this.models.length >= 1){
			model.moveToCameraPosition( this.canvas.width/2,this.canvas.height/2 , this.canvas.width, this.canvas.height);
		}
		
		this.models.push(model);		
		*/
	}
	addModelColor(positions, indices, textureCoordinates, vertexNormals, textureUrl){
		
		
		//var model = new Model(this.gl, this.programInfoSlice, this.programInfo, positions, indices, textureCoordinates, vertexNormals, textureUrl, true);
		var model = new ModelColor(this.gl, this.programInfoSlice, this.programInfoColor, positions, indices, vertexNormals, this.models[0].sliceAmount);
		
		if(this.models.length >= 1){
			model.matchLcdCamera(this.models[0].getCameraMatrix(), this.models[0].lcdNormalsMatrix(), this.models[0].getRotation(), this.models[0].getCameraLcdPlaneRotation());
		}
		
		this.models.push(model);

	}
	
	
	setSliceRect(positions, indices, textureCoordinates, vertexNormals, textureUrl){
		this.sliceRect = new Model(this.gl, this.programInfoSlice, this.programInfo, positions, indices, textureCoordinates, vertexNormals, textureUrl, true);
		this.sliceRect.matchLcdCamera(this.models[0].getCameraMatrix(), this.models[0].lcdNormalsMatrix(), this.models[0].getRotation(), this.models[0].getCameraLcdPlaneRotation());
		this.sliceRect.name = "sliceRect";
		this.models[0].name = "lcd";
	}	
	
	
	rotate(amount, direction){
		
		for(var i=0; i < this.models.length; i++){
			this.models[i].rotate(amount, direction);
		}
		this.sliceRect.rotate(amount, direction);
		
	}
	
	rotateCamera(amount, direction){
		
		for(var i=0; i < this.models.length; i++){
			this.models[i].rotateCamera(amount, direction);
		}
		this.sliceRect.rotateCamera(amount, direction);
		
	}
	
	moveCamera(how){
		
		for(var i=0; i<this.models.length; i++){
			
			this.models[i].moveCamera(how);
			//this.sliceRect.moveCamera([how[0]/2, how[1]/2, how[2]/2]);
			
		}
		
		this.sliceRect.moveCamera(how);

		
	}
	
	zoomCamera(amount){
		
		for(var i=0; i < this.models.length; i++){
			this.models[i].zoomCamera(amount);
		}
		this.sliceRect.zoomCamera(amount);
		
	}
	moveModels(how){
		/*
		for(var i=1; i < this.models.length; i++){
			this.models[i].moveModel(how);
		}
		*/
		
		if(this.selectedModel != null){
			this.selectedModel.moveModel(how);
		}
		
	}
	
	//repositions the sliceRect and the slice framebuffer view(models that are beeing sliced)
	debugRepositionSliceRect(z){
		
		z = parseFloat(z)/4.95;
		console.log("zMoveClick: "+z);
		for(var i=0; i < this.models.length; i++){
			//DEBUG 
			this.models[i].translateSlice(-1*z);
		}
		//DEBUG
		this.sliceRect.translate([0, z/0.01012, 0]);
		
		this.renderToTexture();
		
	}
	
	
	rayCastClick(mouseX, mouseY, width, height){
				
		var distances = [];
						
		for(var i=1; i<this.models.length; i++){
			
			var castResoult = this.models[i].clickRayCast(mouseX, mouseY, width, height);
			distances.push( [ i , castResoult [2]] );
					
			
		}
		var points = this.models[1].clickRayCast(mouseX, mouseY, width, height);
		//this.drawRayCast(points[0], points[1]);
		
		var closestModel = -1;
		var smallestDistance = 1000000;
		
		for(var i=0; i<distances.length; i++){
			console.log("id:"+distances[i][0]+" d:"+distances[i][1]);
			
			if(distances[i][1] < smallestDistance){
				smallestDistance = distances[i][1];
				closestModel = distances[i][0]
			}
			
		}
		
		console.log("Selected model id: "+closestModel);
		this.selectedModel = this.models[closestModel];
		
		for(var i=0; i<this.models.length; i++){
			this.models[i].setSelected(false);
		}
		this.models[closestModel].setSelected(true);
		
		console.log("");
		console.log("");
	}
	
	
	//debug
	createImageFromTexture(gl , width, height) {
		

		// Read the contents of the framebuffer
		var data = new Uint8Array(width * height * 4);
		gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);


		// Create a 2D canvas to store the result 
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext('2d');

		// Copy the pixels to a 2D canvas
		var imageData = context.createImageData(width, height);
		imageData.data.set(data);
		context.putImageData(imageData, 0, 0);

		var img = new Image();
		img.src = canvas.toDataURL();
		document.body.appendChild(img);
	}
	
	drawRayCast(origin, hitpoint){
		
		
		var rayPositions = [origin[0],origin[1],origin[2],  origin[0],origin[1]+1,origin[2], hitpoint[0],hitpoint[1],hitpoint[2]];
		//var rayPositions = [origin[0],origin[1],origin[2],  origin[0],origin[1]+1,origin[2], origin[0],origin[1],origin[2]+250];
		var rayIndecies = [0, 1, 2];
		var rayUvs = [0,0, 0,1, 1,1];
		var rayNormals = [1,1,1,  1,1,1,  1,1,1];
				
		var model = new Model(this.gl, this.programInfoSlice, this.programInfo, rayPositions, rayIndecies, rayUvs, rayNormals, "./models/test.png", false);
		
		if(this.models.length >= 1){
			model.matchLcdCamera(this.models[0].getCameraMatrix(), this.models[0].lcdNormalsMatrix(), this.models[0].getRotation(), this.models[0].getCameraLcdPlaneRotation());
		}
		this.models.push(model);
		
		
		
	}
	
	
	initSaveFile(){
		
		this.printHeight = 0;
		this.models[0].setSlice(0);
		
		this.layerHeight = 0;
		
		
		for(var i=1; i < this.models.length; i++){
			this.models[i].setSlice(0);
			
			console.log("Model height:"+this.models[i].getModelHeight()+" "+this.models[i].name);
			console.log(this.models[i].getModelHeight()+" >"+this.printHeight);
			
			if(this.models[i].modelHeight > this.printHeight){
				this.printHeight = this.models[i].modelHeight;
			}
			
		}
		
		this.saveFile = new Uint8Array(0);
		
		//add header to the save file
		
		var header = ""+
		"G21;\n"+
		"G91;\n"+
		"M17;\n"+
		"M106 S0;\n"+
		"G28 Z0;\n"+
		";W:480;\n"+
		";H:854;\n";
		for(var i=0; i < header.length; i++){
			this.appendToSaveFile(new Uint8Array([this.toHex(header.charAt(i))]));
		}
		
		
		//Find the top of the print
		
		//getPositionsBUffer
		
		//find the heights z value of positions
		return this.printHeight;
		
	}
	addNewSliceLayerToSaveFile(pixelData, sliceMoveZ){
		
		
		this.layerNum += 1;
		
		this.layerHeight -= sliceMoveZ;
		
		var retract = 5;
		var layerMove = retract-sliceMoveZ;
		var layCureTime = 10;
		
		var move = ""+
		";L:"+this.layerNum+";\n"+
		"M106 S0;\n"+
		"G1 Z5 F17;\n"+
		"G1 Z-"+layerMove+" F60;\n"+
		"{{\n";
		for(var i=0; i < move.length; i++){
			this.appendToSaveFile(new Uint8Array([this.toHex(move.charAt(i))]));
		}
		
		this.appendToSaveFile(pixelData);
		
		var cure = ""+
		"\n}}\n"+
		"M106 S255;\n"+
		"G4 S"+layCureTime+";\n";
		for(var i=0; i < cure.length; i++){
			this.appendToSaveFile(new Uint8Array([this.toHex(cure.charAt(i))]));
		}
		
		
		
	}
	endSaveFileAndSave(){

		console.log("Saving to file");
		
		var footer = ""+
		"M106 S0;\n"+
		"G1 Z10 F25;\n"+
		"M18;\n";
		for(var i=0; i < footer.length; i++){
			this.appendToSaveFile(new Uint8Array([this.toHex(footer.charAt(i))]));
		}
		
		//Make a donwloadeble file and save it
		var blob = new Blob([this.saveFile], {type: "application/octet-stream"});
		var fileName = "print.wow";
		saveAs(blob, fileName);

	}
	toHex(str) {
		var result = 0x00;
		for (var i=0; i<str.length; i++) {
		  result += str.charCodeAt(i);
		}
		return result;
	}
	appendToSaveFile(data){
		
		var temp = new Uint8Array(this.saveFile.length + data.length);
		
		temp.set(this.saveFile);
		temp.set(data, this.saveFile.length);
		
		this.saveFile = temp;

	}
	
	
	
}



export default CanvasHelper