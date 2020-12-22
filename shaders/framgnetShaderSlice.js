


const fsSlice = `
    
	
	varying highp vec4 vWorldPosition;
	
	bool outOfBounds;
	
	

	void main()
	{
		
	  outOfBounds = false;
		
	  if( vWorldPosition.y < -0.469){
		  outOfBounds = true;
	  }	
	  if( vWorldPosition.y > 0.469){
		  outOfBounds = true;
	  }	
	  if( vWorldPosition.x < -0.834){
		  outOfBounds = true;
	  }	
	  if( vWorldPosition.x > 0.834){
		  outOfBounds = true;
	  }
	  
	  if (gl_FrontFacing) // are we looking at a front face?
		{
		  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // yes
		}
	  else
		{
			//check if model is inside lcd
		  if(outOfBounds){
			  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // no
		  }else{
			  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // no
		  }
		  
		}
	}
	
	
  `;
  
export default fsSlice