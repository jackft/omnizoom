export class Zoomer {
    constructor(opts) {
        this.elems = [];
        this.zoomCoef = (opts !== undefined && opts.zoomCoef !== undefined) 
                      ? opts.zoomCoef
                      : 1.05;
        // zooming
        this.zFactor = 0;
        // panning
        this.xDrag = undefined;
        this.yDrag = undefined;
        this.panning = false;
        // transformation matrix...well the trace of it
        this.transformation = [0,0,this.zoomCoef**this.zFactor];
        return this;
    }

    addElem(elem) {
        this.elems.push(elem);
        return this;
    }

    zoom(elem, x, y, zoomIn) {
        this.transformation = this.zoomHelper(elem, x, y, zoomIn)
        this.setTransformation(...this.transformation);
        return this;
    }

    zoomHelper(elem, x, y, zoomIn) {
        const [xOld, yOld, zOld] = this.transformation;
        // figure our if we are zooming in, out, or not at all
        switch (zoomIn) {
            case 0:
                return this.transformation;
                break;
            case 1:
                this.zFactor += 1;
                break;
            case -1:
                this.zFactor -= 1;
                break;
            default:
                console.log("something went wrong setting the zoom level");
                break;
        }
        // get new zoom level
        const zNew = this.zoomCoef**this.zFactor;
        // don't zoom out beyond original size
        if (zNew < 1) {
            return this.transformation;
        }
        // mouse coordinates
        const [xMouse, yMouse] = this.clientPosToRelPos(elem, x, y);
        // old zoom coordinates
        const xOldZ = (xMouse - xOld) / zOld;
        const yOldZ = (yMouse - yOld) / zOld;
        // new zoom coordinates
        const xNewZ = xOldZ * zNew;
        const yNewZ = yOldZ * zNew;
        // update 
        let xNew = xMouse - xNewZ;
        let yNew = yMouse - yNewZ;
        // keep in bounds 
        [xNew, yNew] = this.keepInBounds(elem, xNew, yNew, zNew);
        // make sure scale is to the right of traslate3d
        return [xNew, yNew, zNew];
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

    keepInBounds(elem, x, y, z) {
        // original size of the element
        // this also defines the right, bottom boundary
        const w = elem.clientWidth;
        const h = elem.clientHeight;
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

    pan(elem, x, y) {
        this.transformation = this.panHelper(elem, x, y)
        this.setTransformation(...this.transformation);
        return this;
    }

    panHelper(elem, x, y) {
        // return if no previous value
        const [xMouse, yMouse] = this.clientPosToRelPos(elem, x, y);
        if (!this.panning || this.xDrag == undefined || this.yDrag == undefined) {
            this.xDrag = xMouse;
            this.yDrag = yMouse;
            return this.transformation;
        }
        // get old values
        const [xOld, yOld, zOld] = this.transformation;
        // get the difference between the current and last drag
        const xDelta = xMouse - this.xDrag;
        const yDelta = yMouse - this.yDrag;
        // get new translation values
        let xNew = xOld + xDelta;
        let yNew = yOld + yDelta;
        [xNew, yNew] = this.keepInBounds(elem, xNew, yNew, zOld);
        this.xDrag = xMouse;
        this.yDrag = yMouse;
        return [xNew, yNew, zOld];
    }

    addOnScroll(callback) {
        this.elems.forEach(elem => {
            elem.onwheel = (event) => {
                event.preventDefault();
                const x = event.clientX;
                const y = event.clientY;
                const zoomIn = (event.deltaY < 0) ? 1 : -1;
                this.zoom(elem, x, y, zoomIn);
            }
            if (callback !== undefined) {
                callback(this.x, this.y, this.zoomCoef**this.z);
            }
        });
        return this;
    }

    addOnDrag(callback) {
        this.elems.forEach(elem => {
            // when the mouse goes down, start the pan
            elem.onmousedown = (event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.panning = true;
                }
            }
            // when dragged, pan
            elem.onmousemove = (event) => {
                this.onPan(elem, event, callback);
            }
            window.addEventListener("mousemove", (event) => {
                this.onPan(elem, event, callback);
            });
            // when mouseup, reset
            elem.onmouseup = (event) => {
                this.offPan(elem, event);
            }
            window.addEventListener("mouseup", (event) => {
                this.panning = false;
                this.xDrag = undefined;
                this.yDrag = undefined;
            });
            // Change the cursor to a grabby hand
            // Change it back when no longer panning
            const defaultCursor = elem.style.cursor;
            document.addEventListener("keydown", (event) => {
                if (event.key === "Control") {
                    elem.style.cursor = 'grabbing';
                }
            });
            document.addEventListener("keyup", (event) => {
                if (event.key === "Control") {
                    elem.style.cursor = defaultCursor;
                }
            });
        });
        return this;
    }

    onPan(elem, event, callback) {
        if (event.ctrlKey && this.panning) {
            const x = event.clientX;
            const y = event.clientY;
            if (x != 0 && y != 0 && this.panning) {
                this.pan(elem, x, y);
            }
            if (callback !== undefined) {
                callback(this.x, this.y, this.zoomCoef**this.z);
            }
        } else {
            this.xDrag = undefined;
            this.yDrag = undefined;
            this.panning = false;
        }
    }

    offPan(elem, event) {
        this.xDrag = undefined;
        this.yDrag = undefined;
        this.panning = false;
    }

    getTransformation() {
        return [this.x, this.y, this.zoomCoef**this.z];
    }

    setTransformation(x, y, z) {
        this.elems.forEach(elem => {
            this.setTransformationHelper(elem, x, y, z);
        })
        return this;
    }

    setTransformationHelper(elem, x, y, z) {
        const transformation = `translate3D(${x}px,${y}px,0) scale(${z})`;
        elem.style.setProperty('transform', transformation);
        return this;
    }
}
