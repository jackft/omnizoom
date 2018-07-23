export class Zoomer {
    constructor(opts) {
        this.elemObjs = [];
        this.zoomCoef = (opts !== undefined && opts.zoomCoef !== undefined) 
                      ? opts.zoomCoef
                      : 1.1;
        // zooming
        this.x = 0;
        this.y = 0;
        this.z = 0;
        // panning
        this.xDrag = undefined;
        this.yDrag = undefined;
        this.dragging = false;
        return this;
    }

    addElem(elem) {
        const elemObj = {e: elem, w: elem.clientWidth, h: elem.clientHeight};
        this.elemObjs.push(elemObj);
        return this;
    }

    zoom(x, y, zoomIn) {
        this.elemObjs.forEach(elemObj => {
            this.zoomHelper(elemObj, x, y, zoomIn);
        });
        return this;
    }

    zoomHelper(elemObj, x, y, zoomIn) {
        const zOld = this.zoomCoef**this.z;
        let z = undefined;
        switch (zoomIn) {
            case 0:
                z = this.z;
                break;
            case 1:
                z = this.z + 1;
                break;
            case -1:
                z = this.z - 1;
                break;
            default:
                console.log("something went wrong setting the zoom level");
                break;
        }
        const zNew = this.zoomCoef**z;

        if (zNew < 1) {
            return this;
        }
        
        // mouse coordinates
        const [xMouse, yMouse] = this.clientPosToRelPos(elemObj.e, x, y);

        // old zoom coordinates
        const xOld = (xMouse - this.x) / zOld;
        const yOld = (yMouse - this.y) / zOld;

        // new zoom coordinates
        const xNew = xOld * zNew;
        const yNew = yOld * zNew;

        // update 
        this.x = xMouse - xNew;
        this.y = yMouse - yNew;
        this.z = z;

        // keep in bounds 
        [this.x, this.y] = this.keepInBounds(elemObj, this.x, this.y, this.zoomCoef**(z));

        // make sure scale is to the right of traslate3d
        this.setTransformationHelper(elemObj, this.x, this.y, zNew);        
    }

    clientPosToRelPos(elem, x, y) {
        // scroll offset
        const xScroll = window.pageXOffset || document.documentElement.scrollLeft;
        const yScroll = window.pageYOffset || document.documentElement.scrollTop;

        // container offset
        const xOffset = elem.offsetLeft;
        const yOffset = elem.offsetTop;

        // relative coordinates
        const xMouse = x - xOffset + xScroll;
        const yMouse = y - yOffset + yScroll;
        return [xMouse, yMouse];
    }

    keepInBounds(elemObj, x, y, z) {
        // original size of the element
        // this also defines the right, bottom boundary
        const w = elemObj.w;
        const h = elemObj.h;

        // there should be no void space left of the element
        // there should be no void space right of the element
        if (x > 0) {
            x = 0;
        } else if (x + w*z < w) {
            x = w*(1 - z);
        }
        // there should be no void space above the element
        // there should be no void space below the element
        if (y > 0) {
            y = 0;
        } else if (y + h*z < h) {
            y = h*(1 - z);
        }
        return [x, y];
    }

    pan(x, y) {
        this.elemObjs.forEach(elemObj => {
            this.panHelper(elemObj, x, y);
        });
        return this;
    }

    panHelper(elemObj, x, y) {
        const [xMouse, yMouse] = this.clientPosToRelPos(elemObj.e, x, y);
        let xx = undefined;
        let yy = undefined;
        if (this.xDrag !== undefined && this.yDrag !== undefined) {
            xx = xMouse - this.xDrag;
            yy = yMouse - this.yDrag;

           const z = this.zoomCoef**(this.z);

           [this.x, this.y] = this.keepInBounds(elemObj, this.x + xx, this.y + yy, z);
           this.setTransformationHelper(elemObj, this.x, this.y, z);
        }
        this.xDrag = xMouse;
        this.yDrag = yMouse;
    }

    addOnScroll(callback) {
        this.elemObjs.forEach(elemObj => {
            elemObj.e.onwheel = (event) => {
                event.preventDefault();
                const x = event.clientX;
                const y = event.clientY;
                const zoomIn = (event.deltaY < 0) ? 1 : -1;
                this.zoom(x, y, zoomIn);
            }
            if (callback !== undefined) {
                callback(this.x, this.y, this.zoomCoef**this.z);
            }
        });
        return this;
    }

    addOnDrag(callback) {
        //
        this.elemObjs.forEach(elemObj => {
            switch (elemObj.e.tagName) {
                case "IMG":
                    elemObj.e.ondrag = (event) => {
                        const x = event.clientX;
                        const y = event.clientY;
                        if (x != 0 && y != 0) {
                            this.pan(x, y);
                        }
                        if (callback !== undefined) {
                            callback(this.x, this.y, this.zoomCoef**this.z);
                        }
                    }
                    elemObj.e.onmouseup = (event) => {
                        this.xDrag = undefined;
                        this.yDrag = undefined;
                    }
                    elemObj.e.ondragend = (event) => {
                        this.xDrag = undefined;
                        this.yDrag = undefined;
                    }
                    elemObj.e.ondragleave = (event) => {
                        this.xDrag = undefined;
                        this.yDrag = undefined;
                    }
                    break;
                default:
                    elemObj.e.onmousemove = (event) => {
                        const x = event.clientX;
                        const y = event.clientY;
                        if (x != 0 && y != 0 && this.dragging) {
                            this.pan(x, y);
                        }
                        if (callback !== undefined) {
                            callback(this.x, this.y, this.zoomCoef**this.z);
                        }
                    }
                    elemObj.e.onmousedown = (event) => {
                        this.dragging = true;
                    }
                    elemObj.e.onmouseup = (event) => {
                        this.xDrag = undefined;
                        this.yDrag = undefined;
                        this.dragging = false;
                    }
                    break;
            }
        });
        return this;
    }

    getTransformation() {
        return [this.x, this.y, this.zoomCoef**this.z];
    }

    setTransformation(x, y, z) {
        this.elemObjs.forEach(elemObj => {
            this.setTransformationHelper(elemObj, x, y, z);
        })
        return this;
    }

    setTransformationHelper(elemObj, x, y, z) {
        const transformation = `translate3D(${x}px,${y}px,0) scale(${z})`;
        elemObj.e.style.setProperty('transform', transformation);
        return this;
    }
}
