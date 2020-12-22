



class ModelColor{
	
	
	constructor(gl, programInfoSlice, programInfo, positions, indices, vertexNormals, slicePosition){
		
		console.log("New model color beeing created ");
		
		this.gl = gl;
		
		//find the the center of the object
		this.recenterVector = this.findRecenterVector(positions);
		//translate to the center
		this.modelHeight;
		positions = this.centerPositions(this.recenterVector, positions);
		
		//SETUP FOR RENDERING TO SCREEN VIEW
		this.programInfo = programInfo;
		
		this.indeciesLenght = indices.length;

		
		//THE BUFFERS
		//vertexPosition
		this.positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
		//indecies
		this.indecies = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indecies);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
		//normals
		this.normalsBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), this.gl.STATIC_DRAW);
		
		//MATRICIES
		//prjectionMatrix
		this.projectionMatrix = mat4.create();
		//               matrix                 fieldOfView           aspectRatio                                                zNear  ZFar 
		mat4.perspective(this.projectionMatrix, (45 * Math.PI / 180), (this.gl.canvas.clientWidth / this.gl.canvas.clientHeight), 0.1, 10000);
		
		//modelViewMatrix
		this.modelViewMatrix = mat4.create();
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, (180 * Math.PI / 180), [0, 1, 0]);
		
		
		//normalsMAtrix
		this.normalMatrix = mat4.create();
		mat4.invert(this.normalMatrix, this.modelViewMatrix);
		mat4.transpose(this.normalMatrix, this.normalMatrix);
		
		//cameraMatrix
		this.cameraMatrix = mat4.create();
		mat4.translate(this.cameraMatrix, this.cameraMatrix, [0.0, 0.0, -250.0]);
		

		
		//Object metadata
		this.rotation = 0;
		this.scale = [1, 1, 1];
		
		
		
		
		//SETUP FOR RENDERING TO THE SLICE FRAMEBUFFER
		this.programInfoSlice = programInfoSlice;
				
		//Position buffer
		this.positionBufferSlice = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBufferSlice);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
		
		this.indeciesSlice = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.indeciesSlice);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
		
		this.modelViewMatrixSlice = mat4.create();
		mat4.scale(this.modelViewMatrixSlice, this.modelViewMatrixSlice, [0.01012, 0.01012, 0.01012]);
		mat4.rotate(this.modelViewMatrixSlice, this.modelViewMatrixSlice, (90 * Math.PI / 180), [1, 0, 0]);
		
		this.sliceAmount = slicePosition;
		this.projectionMatrixSlice = mat4.create();
		mat4.ortho(this.projectionMatrixSlice, -1, 1, -1, 1, this.sliceAmount, 100);

		
		this.indeciesLenghtSlice = indices.length;
		
		this.cameraLcdPlaneRotation = 0;
		this.rotation = 0;
		
		
		this.name = "";
		
		
		this.colors = {
			idle: [0.0, 0.0, 1.0, 1.0],
			selected: [0.0, 1.0, 0.0, 1.0],
		};
		this.selected = false;
		
		
		
		
	}
	
	
	
	//cetners model for scaling in xy direction, levels the z direction(lowest point to 0  z)
	//computes the highest point(modelHeight)
	findRecenterVector(positions){
		
		var sumX = 0;
		var sumY = 0;
		
		var lowestPoint = 0;
		var highestPoint = 0;
		
		for(var i=0; i<positions.length; i+=3){
			
			//console.log(positions[i]);
			sumX += parseFloat(positions[i]);
			sumY += parseFloat(positions[i+2]);
			
			if(positions[i+1] < lowestPoint){
				lowestPoint = parseFloat(positions[i+1]);
			}
			if(positions[i+1] > highestPoint){
				highestPoint = positions[i+1];
			}
			
		}
		
		this.modelHeight = highestPoint - lowestPoint;
		console.log("This.modelHeight"+this.modelHeight);
		
		var recenterVector = [sumX/(positions.length/3), lowestPoint, sumY/(positions.length/3)];
		
		return recenterVector;
	}

	getModelHeight(){
		return this.modelHeight;
	}
	
	centerPositions(recenterVector, positions){
		
		for(var i=0; i<positions.length; i+=3){
			
			var x = parseFloat(positions[i]);
			var y = parseFloat(positions[i+2]);
			var z = parseFloat(positions[i+1]);
			
			x -= recenterVector[0];
			y -= recenterVector[2];
			z -= recenterVector[1];
			
			positions[i] = x+"";
			positions[i+2] = y+"";
			positions[i+1] = z+"";
			
		}
		
		return positions;
	}
	
	
	draw(){
		
		
		//SRTUP WEBGL FOR READING BUFFERS
		
		//positionBuffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		//                         (attribLocation,                       numComponents,    type, normalize, stride, offset)
		this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
		
		
		//normalsBuffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
		this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexNormal, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNormal);
		

		//tellwebgl witch program to use
		this.gl.useProgram(this.programInfo.program);
		
		
		//give buffer with vertecies mapping for drawElements
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indecies);
		
		//Set color
		if(this.selected){
			this.gl.uniform4f(this.programInfo.unifromLocations.color, 0.3, 0.6, 1.0, 1.0);
		}else{
			this.gl.uniform4f(this.programInfo.unifromLocations.color, 0.0, 0.0, 1.0, 1.0);
		}
		
		//ENABLE MATRICIES
		//prjectionMatrix
		this.gl.uniformMatrix4fv(this.programInfo.unifromLocations.projectionMatrix, false, this.projectionMatrix);
		//modelViewMatrix
		this.gl.uniformMatrix4fv(this.programInfo.unifromLocations.modelViewMatrix, false, this.modelViewMatrix);
		//normalsMAtrix
		this.gl.uniformMatrix4fv(this.programInfo.unifromLocations.normalMatrix, false, this.normalMatrix);
		//cameraMatrix
		this.gl.uniformMatrix4fv(this.programInfo.unifromLocations.cameraMatrix, false, this.cameraMatrix);
		
		
		//RENDER SCENE
		//               style                  vertexCount          type                 offset
		this.gl.drawElements(this.gl.TRIANGLES, this.indeciesLenght, this.gl.UNSIGNED_SHORT, 0);
		
	}
	
	
	drawForSlice(){
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBufferSlice);
		this.gl.vertexAttribPointer(this.programInfoSlice.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfoSlice.attribLocations.vertexPosition);
		
		this.gl.useProgram(this.programInfoSlice.program);
		
		
		this.gl.uniformMatrix4fv(this.programInfoSlice.uniformLocations.modelViewMatrix, false, this.modelViewMatrixSlice);
		this.gl.uniformMatrix4fv(this.programInfoSlice.uniformLocations.projectionMatrix, false, this.projectionMatrixSlice);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indecies);//TODO(): WHY CAN I NOT USE this.indeciesSlice!????
		
		this.gl.drawElements(this.gl.TRIANGLES, this.indeciesLenght, this.gl.UNSIGNED_SHORT, 0);
		
	}
	
	
	rotate(amount, direction){
		
		
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, amount, direction);
		mat4.rotate(this.normalMatrix, this.normalMatrix, amount, direction);
		
		
	}
	
	rotateCamera(amount, direction){
		
		
		if(direction[0] == 1){//if rotate UP or DOWN
		
			
			//first orinate back to original LEFT RIGHT direction
			mat4.rotate(this.cameraMatrix, this.cameraMatrix, -1*this.rotation, [0, 1, 0]);
			mat4.rotate(this.normalMatrix, this.normalMatrix, -1*this.rotation, [0, 1, 0]);
			
			//apply rotate UP or DOWN
			mat4.rotate(this.cameraMatrix, this.cameraMatrix, amount, direction);
			mat4.rotate(this.normalMatrix, this.normalMatrix, amount, direction);
			
			//rotate back to previous position LEFT and RIGHT
			mat4.rotate(this.cameraMatrix, this.cameraMatrix, this.rotation, [0, 1, 0]);
			mat4.rotate(this.normalMatrix, this.normalMatrix, this.rotation, [0, 1, 0]);
			
			
			
			
		}else if(direction[1] == 1){
			
			
			this.cameraLcdPlaneRotation += amount;
			this.rotation += amount;
			
			//apply rotate UP or DOWN
			mat4.rotate(this.cameraMatrix, this.cameraMatrix, amount, direction);
			mat4.rotate(this.normalMatrix, this.normalMatrix, amount, direction);
			
			
		}
		
	}
	
	zoomCamera(amount){
		
		mat4.scale(this.cameraMatrix, this.cameraMatrix, amount);
		
	}
	
	moveCamera(how){
		
		how = this.adjustMoveVectorRotationToCamera(how);
		mat4.translate(this.cameraMatrix, this.cameraMatrix, how);
		
		
	}
	
	setRotation(amount){
		
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, (amount * Math.PI / 180), [1, 0, 0]);
		
	}
	
	
	translate(how){
		
		mat4.translate(this.modelViewMatrix, this.modelViewMatrix, how);
		mat4.translate(this.normalMatrix, this.normalMatrix, how);
		
	}
	
	translateSlice(amount){
		
		this.sliceAmount += amount;
		mat4.ortho(this.projectionMatrixSlice, -1, 1, -1, 1, this.sliceAmount, 100);

		
	}
	setSlice(height){
		this.sliceAmount = height;
		mat4.ortho(this.projectionMatrixSlice, -1, 1, -1, 1, this.sliceAmount, 100);
	}
	
	moveModel(how){
		
		how = this.adjustMoveVectorRotationToCamera(how);
		
		mat4.translate(this.modelViewMatrix, this.modelViewMatrix, how);
		mat4.translate(this.modelViewMatrixSlice, this.modelViewMatrixSlice, how);
		
	}
	adjustMoveVectorRotationToCamera(how){
		
		return [ (Math.cos(this.cameraLcdPlaneRotation)*how[0] - Math.sin(this.cameraLcdPlaneRotation)*how[2]), 0, (Math.sin(this.cameraLcdPlaneRotation)*how[0] + Math.cos(this.cameraLcdPlaneRotation)*how[2]) ];
		
	}
	
	matchLcdCamera(lcdCameraMatrix, lcdNormalsMatrix, rotation, lcdRotation){
		console.log("Camera Matched");
		/*
		this.normalMatrix = lcdNormalsMatrix;
		this.cameraMatrix = lcdCameraMatrix;
		*/
		mat4.copy(this.cameraMatrix, lcdCameraMatrix);
		mat4.copy(this.normalMatrix, lcdNormalsMatrix);
		
		this.rotation = rotation;
		this.cameraLcdPlaneRotation = lcdRotation;
		
		
		//mat4.mul(this.normalMatrix, this.normalMatrix, lcdNormalsMatrix);
		//mat4.mul(this.cameraMatrix, this.cameraMatrix, lcdCameraMatrix);
		
		
	}
	getCameraMatrix(){
		return this.cameraMatrix;
	}
	lcdNormalsMatrix(){
		return this.normalMatrix;
	}
	getRotation(){
		return this.rotation;
	}
	getCameraLcdPlaneRotation(){
		return this.cameraLcdPlaneRotation;
	}
	
	calculateBoundingBox(){
		
	}
	clickRayCast(mouseX, mouseY, width, height){
		
		//convert to normalized screen 
		var normalizedX = ( mouseX  / width ) * 2 - 1;
		var normalizedY = ( mouseY  / height ) * 2 - 1;
		//CLICK NORAMLIZTION WORKS
		
		//covnvert to homogenious
		var clipCoords = vec4.fromValues(normalizedX, -1*normalizedY, 1, 1);
		//WTF CHANGING 3RD PARAMETER DOESN'T EFFET ANYTHING
				
		//inverted projectionMatrix
		var inverseProjection = mat4.create();
		mat4.invert(inverseProjection, this.projectionMatrix); 
		//INVERSE PROJECTION MATRIX IS CORRECT
		var eyeCoords = vec4.create();
		vec4.transformMat4(eyeCoords, clipCoords, inverseProjection);
		eyeCoords = vec4.fromValues(eyeCoords[0], eyeCoords[1], -0.00, 0.0);
		
		//inverted cameraMatrix
		var inverseCamera = mat4.create();
		mat4.invert(inverseCamera, this.cameraMatrix);
		var cameraCoodrs = vec4.create();
		vec4.transformMat4(cameraCoodrs, eyeCoords, inverseCamera);
		cameraCoodrs = vec3.fromValues(cameraCoodrs[0], cameraCoodrs[1], cameraCoodrs[2]);
		//vec3.normalize(cameraCoodrs, cameraCoodrs);
		var cameraTranslation = vec3.create();
		vec3.add(cameraCoodrs, cameraCoodrs, cameraTranslation);
		
		
		
		//check id it hits bounding box		
		
		//get model displacement point 	
		var inverseModelView = mat4.create();
		mat4.invert(inverseModelView, this.modelViewMatrix);		
		var modelPosition = vec3.create();
		vec3.transformMat4(modelPosition, modelPosition, inverseModelView);
		
		//get camera position
		var moveVector = vec3.fromValues(0, 0, 0);
		vec3.transformMat4(moveVector, moveVector, inverseCamera);
		//vec3.transformMat4(moveVector, moveVector, this.cameraMatrix);
		//mat4.getTranslation(moveVector, this.cameraMatrix);
		
		//get vector from camera to center
		var otc = vec3.create();
		vec3.sub(otc, modelPosition, moveVector);
		//console.log("O to C: "+otc);
		
		
		//check for collision
		var objectCenter = modelPosition;
		var rayOrigin = moveVector;
		var rayDirection = cameraCoodrs;
		var rayOriginToCenter = otc;
		/*
		console.log("objectCenter     : "+objectCenter);
		console.log("rayOrigin        : "+rayOrigin);
		console.log("rayDirection     : "+rayDirection);
		console.log("rayOriginToCenter: "+rayOriginToCenter);
		*/
		
		/*
		var rayVectorLenght = vec3.dot(rayDirection, rayOriginToCenter);
		
		var scaledRayCector = vec3.create();
		vec3.scale(scaledRayCector, rayDirection, rayVectorLenght);
		
		var originToRay = vec3.create();
		vec3.add(originToRay, rayOrigin, scaledRayCector);
		
		var rayDistanceToCenter = vec3.len(originToRay);
		*/
		
		console.log("");
		
		
		vec3.scale(rayDirection, rayDirection, 250);
		//return [rayOrigin, rayDirection];
		
		
		//compute the actual ray vector (vector between origin and cast point)
		var rayVector = vec3.create();
		vec3.sub(rayVector, rayDirection, rayOrigin);
		vec3.normalize(rayVector, rayVector);
		
		//calculate the vector between rayOrigin and modelCenter(position)
		var rayOriginToModelCenter = vec3.create();
		vec3.sub(rayOriginToModelCenter, objectCenter, rayOrigin);
		
		//Dot product will give rayVector distance as it is projected onto it by vector from ray origin to model center
		var rayCenterLength = vec3.create();
								//rayOriginToModelCenter DOT rayVector(normalized)
		rayCenterLength = Math.abs(vec3.dot(rayOriginToModelCenter, rayVector));
		//scale normalized rayVector by the calculated ray distance
		vec3.scale(rayVector, rayVector, rayCenterLength);
		
		//calculate the point rayVector is not pointing to from rayOrigin
		var rayPoint = vec3.create();
		vec3.add(rayPoint, rayOrigin, rayVector);
		
		//get distance from rayCastPoint to model center
		var distanceToObjCenter = vec3.distance(rayPoint, objectCenter);
		console.log("Distance to center: "+distanceToObjCenter);
		
		
		return [rayOrigin, rayPoint, distanceToObjCenter];
		
	}
	
	moveToCameraPosition(mouseX, mouseY, width, height){
		
		var rayCast = this.clickRayCast(mouseX, mouseY, width, height);
		
		var moveVector = vec3.create();
		mat4.getTranslation(moveVector, this.cameraMatrix);
		
		//var distance = vec3.distance([0, 0, 0], moveVector);
		var distance = vec3.distance([0, 0, 0], [0, 0, 250]);
		vec3.scale(rayCast, rayCast, distance);
		
		
		//mat4.translate(this.modelViewMatrix, this.modelViewMatrix, moveVector);
		mat4.translate(this.modelViewMatrix, this.modelViewMatrix, rayCast);
		
		
	}
	
	setSelected(state){
		this.selected = state;
	}
	
	loadTexture(url){
		
		
		
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		
		//              level interFormat   w  h border srcFormat   srcType                pixel
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, (new Uint8Array([0, 100, 255, 255])));
		
		var gl = this.gl;
		var texture = this.texture;
		
		const image = new Image();
		image.onload = function(){
						
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			
			//cheking for powr of 2 optimization
			if(isPowerOf2(image.width) && isPowerOf2(image.height)){
				gl.generateMipmap(gl.TEXTURE_2D);	
			}else{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE	);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);	
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);	
				//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			}
			
			
		}
		image.src = url;
		
	}
	
	
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}


export default ModelColor

