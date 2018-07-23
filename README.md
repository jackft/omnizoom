# Zoomy
A dumb js class for zooming into points of dom elements: videos, images, divs, etc.
Videos and images can be either aliased or anti-aliased.

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
const zoomy1 = new zoomy.Zoomy()
                        .addElem(document.getElementById("zoomable-video"))
                        .addOnScroll();
// add zoom functionality to the img
const zoomy2 = new zoomy.Zoomy()
                        .addElem(document.getElementById("zoomable-img"))
                        .addOnScroll();
// add zoom functionality to the div
const zoomy3 = new zoomy.Zoomy()
                        .addElem(document.getElementById("zoomable-div"))
                        .addOnScroll();
```

# Use this dumb code in your project
## Simple Way
Put these two lines in your header
```html
<link rel="stylesheet" href="zoomy.css">
<script type="text/javascript" src="zoomy.js"></script>  
```

## With Node
