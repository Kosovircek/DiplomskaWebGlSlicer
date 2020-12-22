


class RenderSaver{
	
	
	constructor(gl){
		
		
		this.gl = gl;
		
		this.width = 1024;
		this.heigth = 1024;
		
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.heigth, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE	);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);	
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		
		
		this.frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		
		this.attachmentPoint = gl.COLOR_ATTACHMENT0; //                                        ?????????????????
		gl.framebufferTexture2D(gl.FRAMEBUFFER, this.attachmentPoint, this.gl.TEXTURE_2D, this.texture, 0);
		
		this.depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
		
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.heigth);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
		
		
		
		
		/*
		
		// Create and bind the framebuffer
		this.frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

		// attach the texture as the first color attachment
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		const level = 0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.texture, level);

		// create a depth renderbuffer
		this.depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

		// make a depth buffer and the same size as the targetTexture
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.heigth);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);


		console.log("check: "+gl.checkFramebufferStatus(gl.FRAMEBUFFER));
		console.log("status: "+this.gl.FRAMEBUFFER_COMPLETE);
		*/
		
		
	}
	
	
}




export default RenderSaver