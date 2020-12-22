



const vsSlice = `
	
	attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

	varying highp vec4 vWorldPosition;

    void main(void) {
		
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	  
	  vWorldPosition = uModelViewMatrix * aVertexPosition;

    }
  `;


export default vsSlice