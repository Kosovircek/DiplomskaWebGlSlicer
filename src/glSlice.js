


class GlSlice{
	
	
	
	constructor(gl, programInfo){
		
		
		this.gl = gl;
		
		this.programInfo = programInfo;
		
		vertecies = [
		
			
		
		];
		
		
		//CreateBuffers
		this.positionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		this.gl.bufferData();
		
		
		
		this.modelViewMatrix = mat4.create();
		mat.translate(this.modelViewMatrix, this.modelViewMatrix, [0.0, 0.0, -6.0]);
		
		this.projectionMatrix = mat4.create();
		mat.ortho();
		
		
	}
	
	
	
	
	draw(){
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		this.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
		
		
		this.gl.useProgram(this.programInfo.program);
		
		
		this.gl.unifromMatrix4fv(this.programInfo.unifromLocations.projectionMatrix, false, this.projectionMatrix);
		this.gl.unifromMatrix4fv(this.programInfo.unifromLocations.modelViewMatrix, false, this.modelViewMatrix);
		
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, vertexCount);
		
		
	}
	
	
}