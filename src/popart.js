/* Importiere CropperJS */
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'

import _ from 'lodash'

class Popart {
  
  constructor( nodeId = 'popart', minSize = 500 ){
    this.canvas
    this.ctx
    this.defaultValues = {
      minSize: minSize,
      threshold: [255, 200],
      color: ["#ffffff", "#ff0000", "#000000"]
    }
    this.rootNode = this._init( nodeId )
  }
  
  _init( nodeId ){

    let rootNode;
    
    if( !document.getElementById( nodeId ) ){
      rootNode = document.createElement('div');
      rootNode.id = nodeId;
      document.body.appendChild( rootNode );
    }
    
    rootNode = document.getElementById( nodeId );

    this.preview = this._createElement( 'div', {
      id: "preview"
    }, rootNode )

    this.controls = this._createElement( 'div', {
      id: "controls"
    }, rootNode )
    
    let canvas = document.createElement('canvas');
    canvas.id = "canvas";
    this.preview.appendChild( canvas );

    this.canvas = document.getElementById( canvas.id );
    this.ctx = this.canvas.getContext('2d');

    /* Create image input */
    this._createElement( 'input', {
      type: "file",
      id: "imageFile",
      name: "file",
      accept: "image/*",
      events: {
        change: this._handleFileSelect
      }
    }, this.controls)

    /* Create threshold sliders */
    for(let i = 0; i<=1; i++){
      this._createElement( 'input', {
        type: "range",
        id: "slider" + ( i === 0 ? '' : i+1 ),
        min: 0,
        max: 255,
        value: this.defaultValues.threshold[i],
        events: {
          change: this.onChangeInputValues
        }
      }, this._createElement('p', {}, this.controls) )
    }

    /* Create color inputs */
    for(let i = 0; i<=2; i++){
      this._createElement( 'input', {
        type: "color",
        id: "color" + ( i === 0 ? '' : i+1 ),
        value: this.defaultValues.color[i],
        events: {
          change: this.onChangeInputValues
        }
      }, this.controls )
    }

    /* Create download link */
    this.downloadLink = this._createElement( 'a',  {
        text: "Bild herunterladen",
        download: "popart.png",
        class: "button"
    }, this.controls )
    
    this.cropperDiv = this._createElement( 'div', {
      id: "cropper"
    }, this.controls )
    
    return rootNode;
    
  }

  onChangeInputValues(){
	  this._modifyThreshold(document.getElementById('slider').value, document.getElementById('slider2').value, document.getElementById('color').value, document.getElementById('color2').value, document.getElementById('color3').value);
  }

  _modifyThreshold(threshold, threshold2, color, color2, color3 ){ 
    this.ctx.drawImage(this.image, 0, 0)
    let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    color = this.hexToRgb(color);
    color2 = this.hexToRgb(color2);
    color3 = this.hexToRgb(color3);
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i]     = Math.round(avg/threshold) ? color.r : Math.round(avg/threshold2) ? color2.r : color3.r;
      data[i + 1] = Math.round(avg/threshold) ? color.g : Math.round(avg/threshold2) ? color2.g : color3.g;
      data[i + 2] = Math.round(avg/threshold) ? color.b : Math.round(avg/threshold2) ? color2.b : color3.b;
    }
    console.log( 'Image processed' );
    this.ctx.putImageData(imageData, 0, 0);
  }

  _createElement ( tagName, properties, node ){
    let tag = document.createElement( tagName )
    Object.keys(properties).map((key) => {
      let value = properties[key]
      if( key === "events" ){
        Object.keys(value).map((k) => {
          tag.addEventListener(k, value[k].bind(this))
        })
      }
      else if( key === "text" ){
        tag.innerHTML = value
      }
      else {
        tag.setAttribute(key, value);
      }
    })
    if( tag ){
      node.appendChild( tag )
    }
    return tag
  }

  _handleFileSelect(e) {

    let file = e.target.files[0],
        _that = this

    // Only process image files.
    if (file.type.match('image.*')) {
    
      let reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = ((f) => (
        function(e) {
          let img = new Image()
          img.src = e.target.result
          img.onload = (() => {

            _that.image = img;

            if( img.naturalWidth < _that.defaultValues.minSize || img.naturalHeight < _that.defaultValues.minSize ){
              alert('The image must have a width/height not less than' + _that.defaultValues.minSize + 'px.');
            }
            else {

              _that.canvas.setAttribute("width", img.naturalWidth);
              _that.canvas.setAttribute("height", img.naturalHeight);
              _that.ctx.drawImage(img, 0, 0)

              _that.cropperDiv.innerHTML = ''

              _that.outputImage = _that._createElement( 'img', {
                id: "output",
                src: _that.canvas.toDataURL("image/png")
              }, _that.cropperDiv )

            this.renderCroppedImage = () => {
                console.log('crop');
                let img = _that.getCroppedImage()
                img.onload = ((e) => {
                  let img = e.currentTarget
                  _that.image = img
                  _that.canvas.setAttribute("width", img.naturalWidth);
                  _that.canvas.setAttribute("height", img.naturalHeight);
                  _that.ctx.drawImage(img, 0, 0)
                  _that.onChangeInputValues()
                  _that.downloadLink.setAttribute('href', _that.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"))
                })
              }

              this.checkMinCropBoxSize = () => {
                // Get the same data as above 
                let origData = _that.cropper.getCanvasData(),
                    cropBoxData = _that.cropper.getCropBoxData(),
                    smallerSide = origData.naturalHeight >= origData.naturalWidth ? origData.naturalWidth : origData.naturalHeight,
                    canvasCropBoxRatio = origData.height / smallerSide

                console.log( canvasCropBoxRatio )
                console.log( origData, cropBoxData )

                // Modify the dimensions to quit from disabled mode
                if (cropBoxData.height/canvasCropBoxRatio <= _that.defaultValues.minSize) {
                    cropBoxData.width = _that.defaultValues.minSize*canvasCropBoxRatio;
                    cropBoxData.height = _that.defaultValues.minSize*canvasCropBoxRatio;

                    _that.cropper.setCropBoxData(cropBoxData);
                }
              }

              _that.cropper = new Cropper(_that.outputImage, {
                aspectRatio: 1,
                zoomable: false,
                viewMode: 1,
                cropstart: this.checkMinCropBoxSize,
                cropmove: this.checkMinCropBoxSize,
                crop: _.debounce(this.renderCroppedImage, 200)
              })
              
              _that.onChangeInputValues()

            }

          }
        )
      }
      ))(file);

      // Read in the image file as a data URL.
      reader.readAsDataURL(file);

    }

  }

  getCroppedImage(){
    let img = new Image();
    img.src = this.cropper.getCroppedCanvas().toDataURL();
    return img
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
window.p = p;
