# Omnizoom
With some dumb js, you can pan or scroll into anything! Demo: http://jackterwilliger.com/tools-omnizoom/

Pan/Zoom into a video!

![Zoom into a video](http://jackterwilliger.com/wp-content/uploads/2018/07/omnizoom-video.gif)

Pan/Zoom into an image!

![Zoom into an image](http://jackterwilliger.com/wp-content/uploads/2018/07/omnizoom-image.gif)

Pan/Zoom into a container!

![Zoom into a video](http://jackterwilliger.com/wp-content/uploads/2018/07/omnizoom-div.gif)

I'm using this to build annotation tools for computer vision datasets and to study the roll spatial context plays in perception. Use it for anything.

# Installation
```
git clone https://github.com/jackft/omnizoom
```
or:
```
npm install --save omnizoom
```

then include some files in your HTML
Put these two lines in your header
```html
<link rel="stylesheet" href="omnizoom.css">
<script type="text/javascript" src="omnizoom.min.js"></script>  
```

If you used git, they'll be in ```omnizoom/dist```
If you used npm, they'll be in ```node_modules/omnizoom/dist```

# Directions
1. make sure you've included the code (above)
2. add the css class ```zoom``` to any zoomable elements
3. add the css class ```zoom-container``` to any container around a zoomable object (this prevents the zoom from overflowing its container.
4. include this somewhere ```(new omnizoom.Zoomer()).addElem(<your-element>).addZoom()```

# Usage
Possible HTML elements:
```html
<div class="zoom-container container" width="50%">
  <video id="zoomable-video" class="zoom" preload="auto" controls src="your-video.mp4"></video>
</div>
<div class="zoom-container container" width="50%">
  <img id="zoomable-img" class="zoom" src="your-img.JPG">
</div>
<div class="zoom-container">
  <div id="zoomable-div" class="zoom">
    ...
  </div>
</div>
```
How to make each element zoomable with the scroll wheel:
```javascript
// add zoom functionality to the video
const zoomy1 = new omnizoom.Zoomer()
                           .addElem(document.getElementById("zoomable-video"))
                           .addZoom();
// add pan functionality to the img
const zoomy2 = new omnizoom.Zoomer()
                           .addElem(document.getElementById("zoomable-img"))
                           .addPan();
// add zoom and pan functionality to the div
const zoomy3 = new omnizoom.Zoomer()
                           .addElem(document.getElementById("zoomable-div"))
                           .addZoom()
                           .addPan();
```
