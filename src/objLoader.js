



class ObjLoader{
	
	constructor(file){
			
		
		this.vertexPositions = [["a"]]; //adeed empy array as first elememnt bacuase OBJ starts arrays with 1 not 0
		this.vertexNormals = [["a"]];
		this.coordPositions = [["a"]];
		this.faces = [];
		this.indecies = [];
		
		
		this.orderedVertecies = [];
		this.orderedNormals = [];
		this.matchedNormals = [];
		this.orderedUvs = [];
		this.matchedUvs = [];
		
		
		this.scanFile(file);
		
		
		
		
	}
	
	
	scanFile(file){
		
		var lines = file.split("\n");
		
		
		for(var i=0; i < lines.length; i++){
			
			if(lines[i][0] == "v"){
				
				if(lines[i][1] == " "){
					
					var words = lines[i].split(" ");
					
					this.vertexPositions.push([words[1], words[2], words[3]]);
					
				}
				else if(lines[i][1] == "n"){
					
					var words = lines[i].split(" ");
					
					this.vertexNormals.push([words[1], words[2], words[3]]);
				}
				else if(lines[i][1] == "t"){
					
					var words = lines[i].split(" ");
					
					this.coordPositions.push([words[1], words[2]]);
				}
				
			}
			else if(lines[i][0] == "f"){
								
				var words = lines[i].split(" ");
				
				var vertex1 = words[1].split("/");
				var vertex2 = words[2].split("/");
				var vertex3 = words[3].split("/");
				
				this.faces.push([[vertex1[0], vertex1[1], vertex1[2]], [vertex2[0], vertex2[1], vertex2[2]], [vertex3[0], vertex3[1], vertex3[2]]]);
				
			}
			
		}

		
		this.matchedNormals = new Array(this.vertexPositions.length);
		this.matchedUvs = [];
		
		for(var i=0; i < this.faces.length; i++){
			
			var face = this.faces[i];
			
			this.matchedNormals[face[0][0]] = this.vertexNormals[face[0][2]];
			this.matchedNormals[face[1][0]] = this.vertexNormals[face[1][2]];
			this.matchedNormals[face[2][0]] = this.vertexNormals[face[1][2]];
			/*if(face[0][2] == undefined){
				console.log("undefined: " + face[0][2]);
			}else{
				console.log(this.vertexNormals[face[0][2]]);
			}*/
			//console.log("this.matchedNormals: " + this.matchedNormals[face[0][0]] + " : " + face[0][0] + " - " + this.vertexNormals[face[0][2]]);
			
			console.log("face: " + i);
			console.log(face[0][2] + " <- " + this.vertexNormals[face[0][2]]);
			console.log(face[1][2] + " <- " + this.vertexNormals[face[1][2]]);
			console.log(face[2][2] + " <- " + this.vertexNormals[face[1][2]]);
			

			this.matchedUvs[face[0][0]] = this.coordPositions[face[0][1]];
			this.matchedUvs[face[1][0]] = this.coordPositions[face[1][1]];
			this.matchedUvs[face[2][0]] = this.coordPositions[face[2][1]];

			
			this.indecies.push(parseInt(face[0][0]-1));//substracting 1 because WebGl arrays begin with 0
			this.indecies.push(parseInt(face[1][0]-1));//will have to shift the arrays later
			this.indecies.push(parseInt(face[2][0]-1));
			
			
		}

		console.log("this.vertexNormals");
		console.log(this.vertexNormals);

		console.log("matchedNormals");
		console.log(this.matchedNormals.slice());
		
		//Deleting the first dummy elemnt because WebGL arrays start with 0
		this.vertexPositions.shift();
		this.matchedNormals.shift();
		this.matchedUvs.shift();

		

		for(let i=0; i < this.faces.length; i++){
			if(this.faces[i][0][0] == 0){
				console.log("1 should not be undefined");
			}
		}
		console.log(this.matchedNormals[this.faces[0][0][0]] + " -- " + this.vertexNormals[this.faces[0][0][2]]);
		console.log(this.faces[0][0][0]);
		console.log(this.faces);
		
		//Convert from arrays in arrays into a single arrays with consecutive numbers
		for(var i=0; i < this.vertexPositions.length; i++){
			this.orderedVertecies.push(parseFloat(this.vertexPositions[i][0]));
			this.orderedVertecies.push(parseFloat(this.vertexPositions[i][1]));
			this.orderedVertecies.push(parseFloat(this.vertexPositions[i][2]));
		}	
		for(var i=1; i < this.matchedNormals.length; i++){
			this.orderedNormals.push(parseFloat(this.matchedNormals[i][0]));
			this.orderedNormals.push(parseFloat(this.matchedNormals[i][1]));
			this.orderedNormals.push(parseFloat(this.matchedNormals[i][2]));
		}
		for(var i=0; i < this.matchedUvs.length; i++){
			this.orderedUvs.push(parseFloat(this.matchedUvs[i][0]));
			this.orderedUvs.push(parseFloat(this.matchedUvs[i][1]));
		}
		
		console.log("positions: "+this.vertexPositions);
		console.log("normals: "+this.matchedNormals);
		console.log("uvs: "+this.matchedUvs);
		console.log("idnecies: "+this.indecies);
		

	}
	
	
	getTextureCoords(){
		var textCoords = new Array((this.indecies.length*2));
		
		for(var i=0; i < textCoords.length; i++){
			textCoords[i] = 0.0;
		}
		return textCoords;
	}
	
}


export default ObjLoader