# Omnizoom
With some dumb js, you can scroll into anything!

Scroll into a video!

![Zoom into a video](http://jackterwilliger.com/omnizoom-video/)

Scroll into an image!

![Zoom into a video](http://jackterwilliger.com/omnizoom-image/)

Scroll into a container!

![Zoom into a video](http://jackterwilliger.com/omnizoom-div/)

I'm using this to build annotation tools for computer vision. Use it for anything.

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
