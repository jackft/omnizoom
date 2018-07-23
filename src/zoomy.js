export class Zoomy {
    constructor(opts) {
        this.elemObjs = [];
        this.zoomCoef = (opts !== undefined && opts.zoomCoef !== undefined) 
                      ? opts.zoomCoef
                      : 1.1;
        this.x = 0;
        this.y = 0;
        this.z = 0;
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

        // scroll offset
        const xScroll = window.pageXOffset || document.documentElement.scrollLeft;
        const yScroll = window.pageYOffset || document.documentElement.scrollTop;

        // container offset
        const xOffset = elemObj.e.offsetLeft;
        const yOffset = elemObj.e.offsetTop;
        
        // mouse coordinates
        const xMouse = x - xOffset + xScroll;
        const yMouse = y - yOffset + yScroll;

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
        const transformation = `translate3D(${this.x}px,${this.y}px,0) scale(${zNew})`;
        elemObj.e.style.setProperty('transform', transformation);
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

    addOnScroll() {
        this.elemObjs.forEach(elemObj => {
            elemObj.e.onwheel = (event) => {
                event.preventDefault();
                const x = event.clientX;
                const y = event.clientY;
                const zoomIn = (event.deltaY < 0) ? 1 : -1;
                this.zoom(x, y, zoomIn);
            };
        });
        return this;
    }
}
