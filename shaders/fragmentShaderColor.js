


const fragmentShaderColor = `
    varying highp vec3 vLighting;

    uniform highp vec4 uColor;
	
	varying highp vec4 vWorldPosition;
	
	bool outOfBounds;

    void main(void) {

	  outOfBounds = false;
		
	  if( vWorldPosition.z < -46.0){
		  outOfBounds = true;
	  }	
	  if( vWorldPosition.z > 46.0){
		  outOfBounds = true;
	  }	
	  if( vWorldPosition.x < -81.5){
		  outOfBounds = true;
	  }	
	  if( vWorldPosition.x > 81.5){
		  outOfBounds = true;
	  }
	  
	  
	  if(outOfBounds){
		  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	  }else{
		  gl_FragColor = vec4(uColor.rgb * vLighting, uColor.a);
	  }
      
	 
	 
    }
  `;


export default fragmentShaderColor