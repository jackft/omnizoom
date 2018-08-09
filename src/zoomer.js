export class Zoomer {
    constructor(opts) {
        this.elems = [];
        ///////////////////////////////////////////////////////////////////////
        // ZOOMING VARIABLES
        // zoom = zoomCoef**zFactor
        //
        // store zoom as these two parts
        // otherwise, by storing zoom, e.g. constantly mul/div by zCoef,
        // floating point erros are introduced
        ///////////////////////////////////////////////////////////////////////
        // zoom coefficient
        if (opts !== undefined && opts.zoomCoef !== undefined) {
            this.zoomCoef = opts.zoomCoef;
        } else {
            this.zoomCoef = 1.05;
        }
        // zooming factor
        this.zFactor = 0;


        ///////////////////////////////////////////////////////////////////////
        // PANNING VARIABLES
        // xDelta = x - xDown
        // yDelta = y - yDown
        ///////////////////////////////////////////////////////////////////////
        // store the point a drag starts
        this.xDown = undefined;
        this.yDown = undefined;
        // mouse position when a drag starts
        this.xDrag = undefined;
        this.yDrag = undefined;
        // the element currently panning
        this.panning = undefined;

        ///////////////////////////////////////////////////////////////////////
        // TRANSFORMATION MATRIX
        //
        // a transformation matrix is linear operator which can do:
        // translations (panning)
        // scaling (zooming)
        // sheering (we don't want to do that)
        // rotating (we also don't want to do that)
        //
        // For our purposes, since the transformation matrix looks like:
        // [[z, 0, x],
        //  [0, z, y],
        //  [0, 0, z]]
        //
        //  we can just represent it as [x, y, z]
        //
        //  where z is the zoom and xt and xt are the amounts to pan
        //
        ///////////////////////////////////////////////////////////////////////
        // transformation matrix...well the trace of it
        const z = this.zoomCoef**this.zFactor;
        this.transformation = [0, 0, z];
        return this;
    }

    addElem(elem) {
        this.elems.push(elem);
        return this;
    }

    zoom(elem, x, y, zoomIn) {
        this.transformation = this.zoomHelper(elem, x, y, zoomIn);
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

        return [xNew, yNew, zNew];
    }

    clientPosToRelPos(elem, x, y) {
        // scroll offset
        const xScroll = window.pageXOffset ||
                        document.documentElement.scrollLeft;
        const yScroll = window.pageYOffset ||
                        document.documentElement.scrollTop;
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
        this.transformation = this.panHelper(elem, x, y);
        this.setTransformation(...this.transformation);
        return this;
    }

    panHelper(elem, x, y) {
        // get old values
        const zOld = this.transformation[2];
        // get the difference between the down and current point
        const xDelta = x - this.xDown;
        const yDelta = y - this.yDown;
        // return if no previous value
        if (xDelta === undefined || yDelta === undefined) {
            return this.transformation;
        }
        // get new translation values
        let xNew = this.xDrag + xDelta;
        let yNew = this.yDrag + yDelta;
        [xNew, yNew] = this.keepInBounds(elem, xNew, yNew, zOld);
        return [xNew, yNew, zOld];
    }

    addZoom(callback) {
        this.elems.forEach(elem => {
            elem.onwheel = (event) => {
                event.preventDefault(); // otherwise the page scrolls
                const x = event.clientX;
                const y = event.clientY;
                const zoomIn = (event.deltaY < 0) ? 1 : -1;
                this.zoom(elem, x, y, zoomIn);
                if (callback !== undefined) {
                    callback(...this.transformation);
                }
            }
    
        });
        return this;
    }

    addPan(callback) {
        this.elems.forEach((elem, i) => {
            // when the mouse goes down, start the pan
            elem.onmousedown = (event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.panning = elem;
                    elem.classList.add("grabbing");
                    elem.classList.remove("grab");
                    this.xDown = event.clientX;
                    this.yDown = event.clientY;
                    // when a drag starts
                    this.xDrag = this.transformation[0];
                    this.yDrag = this.transformation[1];
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
                this.offPan(elem, event);
            });
            // Change the cursor to a grabby hand
            // Change it back when no longer panning
            document.addEventListener("keydown", (event) => {
                if (event.key === "Control") {
                    if (this.panning !== undefined) {
                        elem.classList.add("grabbing");
                    } else {
                        elem.classList.add("grab");
                    }
                }
            });
            document.addEventListener("keyup", (event) => {
                if (event.key === "Control") {
                    elem.classList.remove("grab");
                    elem.classList.remove("grabbing");
                }
            });
        });
        return this;
    }

    onPan(elem, event, callback) {
        if (event.ctrlKey && this.panning === elem) {
            const x = event.clientX;
            const y = event.clientY;
            this.pan(elem, x, y);
            if (callback !== undefined) {
                callback(...this.transformation);
            }
        }
    }

    offPan(elem, event) {
        elem.classList.remove("grabbing");
        if (this.panning !== undefined) {
            elem.classList.add("grab");
        }
        this.xDown = undefined;
        this.yDown = undefined;
        this.panning = undefined;
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


    onClick(callback) {
        this.elems.forEach(elem => {
            elem.onclick = (event) => {
                if (event.key === "Control") {
                    return;
                }
                const x = event.clientX;
                const y = event.clientY;

                const [xMouse, yMouse] = this.clientPosToRelPos(elem, x, y);
                const [xt, yt, z] = this.transformation;
                const xElement = (xMouse - xt)/z;
                const yElement = (yMouse - yt)/z;
                const [xReal, yReal] = this.getRealPoint(elem,
                                                         xElement,
                                                         yElement)
                if (callback !== undefined) {
                    callback(xElement, yElement, xReal, yReal)
                }
            }
        });
    }

    getRealPoint(elem, x, y) {
        switch (elem.tagName) {
            case ("IMG"):
                return [x*elem.naturalWidth/elem.clientWidth,
                        y*elem.naturalHeight/elem.clientHeight]
                break;
            case ("VIDEO"):
                return [x*elem.videoWidth/elem.clientWidth,
                        y*elem.videoHeight/elem.clientHeight]
            default:
                return [x, y];
        }
    }
}
