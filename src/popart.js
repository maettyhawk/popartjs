/* Importiere CropperJS */
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'

class Popart {
  
  constructor( nodeId = 'popart' ){
    this.rootNode = this.init( nodeId );
  }
  
  _init( nodeId ){
    
    let rootNode;
    
    if( !document.getElementById( nodeId ) ){
      rootNode = document.createElement('div');
      rootNode.id = nodeId;
      document.body.appendChild( rootNode );
    }
    
    rootNode = document.getElementById( nodeId );
    
    let canvas = document.createElement('canvas');
    rootNode.appendChild( canvas );
    
    rootNode = document.createElement('div');
    
    return rootNode;
    
  }
  
  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }
  
  loadImage(){
    
  }
  
  get getRootNode(){
    return this.rootNode;
  }

}

const p = new Popart();
console.log( p.getRootNode );
