/*
 * Copyright (C) 2012 David Geary. This code is from the book
 * Core HTML5 Canvas, published by Prentice-Hall in 2012.
 *
 * License:
 *
 * Permission is hereby granted, free of charge, to any person 
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * The Software may not be used to create training material of any sort,
 * including courses, books, instructional videos, presentations, etc.
 * without the express written consent of David Geary.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/

var COREHTML5 = COREHTML5 || {}

// Constructor........................................................

COREHTML5.Slider = function(strokeStyle, fillStyle,
                            knobPercent, knobAnimationDuration) {
   knobPercent = knobPercent || 0;
   knobAnimationDuration = knobAnimationDuration || 1000; // milliseconds

   this.railCanvas = document.createElement('canvas');
   this.railContext = this.railCanvas.getContext('2d');
   this.changeEventListeners = [];

   this.railCanvas.style.cursor = 'pointer';
   
   this.initializeConstants();
   this.initializeStrokeAndFillStyles(strokeStyle, fillStyle);
   this.initializeKnob(knobPercent, knobAnimationDuration);

   this.createDOMTree();
   this.addMouseListeners();
   this.addKnobTransitionListeners();

   return this;
}

// Prototype..........................................................

COREHTML5.Slider.prototype = {

   initializeConstants: function () {
      this.SHADOW_COLOR = 'rgba(100, 100, 100, 0.4)';
      this.SHADOW_OFFSET_X = 3;
      this.SHADOW_OFFSET_Y = 3;
      this.SHADOW_BLUR = 4;

      this.KNOB_SHADOW_COLOR = 'rgba(255,255,0,0.8)';
      this.KNOB_SHADOW_OFFSET_X = 1;
      this.KNOB_SHADOW_OFFSET_Y = 1;
      this.KNOB_SHADOW_BLUR = 0;

      this.KNOB_FILL_STYLE = 'rgba(255, 255, 255, 0.45)';
      this.KNOB_STROKE_STYLE = 'rgba(0, 0, 80, 0.5)';

      this.HORIZONTAL_MARGIN = 2.5 * this.SHADOW_OFFSET_X;
      this.VERTICAL_MARGIN = 2.5 * this.SHADOW_OFFSET_Y;

      this.DEFAULT_STROKE_STYLE = 'gray';
      this.DEFAULT_FILL_STYLE = 'skyblue';
   },

   initializeStrokeAndFillStyles: function(strokeStyle, fillStyle) {
      this.strokeStyle = strokeStyle ? strokeStyle : this.DEFAULT_STROKE_STYLE;
      this.fillStyle = fillStyle ? fillStyle : this.DEFAULT_FILL_STYLE;
   },

   initializeKnob: function (knobPercent, knobAnimationDuration) {
      this.animatingKnob = false;
      this.draggingKnob = false;

      this.knobPercent = knobPercent;
      this.knobAnimationDuration = knobAnimationDuration;

      this.createKnobCanvas();
   },

   createKnobCanvas: function() {
      this.knobCanvas = document.createElement('canvas');
      this.knobContext = this.knobCanvas.getContext('2d');

      this.knobCanvas.style.position = "absolute";
      this.knobCanvas.style.marginLeft = "0px";
      this.knobCanvas.style.marginTop = "1px";
      this.knobCanvas.style.zIndex = "1";
      this.knobCanvas.style.cursor = "crosshair";

      this.activateKnobAnimation();

      this.knobCanvas.style.webkitAnimationTimingFunction = "ease-out";
      this.knobCanvas.style.mozAnimationTimingFunction = "ease-out";
      this.knobCanvas.style.oAnimationTimingFunction = "ease-out";
   },

   createDOMTree: function () {
      var self = this;

      this.domElement = document.createElement('div');
      this.domElement.appendChild(this.knobCanvas);
      this.domElement.appendChild(this.railCanvas);
   },

   appendTo: function (elementName) {
      document.getElementById(elementName).
         appendChild(this.domElement);

      this.setCanvasSize();
      this.resize();
   },

   setCanvasSize: function () {
      var domElementParent = this.domElement.parentNode;

      this.railCanvas.width = domElementParent.offsetWidth;
      this.railCanvas.height = domElementParent.offsetHeight;
   },
   
   resize: function() {
      this.cornerRadius = (this.railCanvas.height/2 -
                           2*this.VERTICAL_MARGIN)/2;

      this.top = this.HORIZONTAL_MARGIN;
      this.left = this.VERTICAL_MARGIN;

      this.right = this.left +
                   this.railCanvas.width - 2*this.HORIZONTAL_MARGIN;

      this.bottom = this.top + 
                   this.railCanvas.height - 2*this.VERTICAL_MARGIN;

      this.knobRadius = this.railCanvas.height/2 -
                        this.railContext.lineWidth;

      this.knobCanvas.style.width = this.knobRadius * 2 + "px";
      this.knobCanvas.style.height = this.knobRadius * 2 + "px";
      this.knobCanvas.width = this.knobRadius*2;
      this.knobCanvas.height = this.knobRadius*2;
   },

   // Event Listeners..................................................

   trackKnobAnimation: function (startPercent, endPercent) {
      var   count = 0
          , KNOB_ANIMATION_FRAME_RATE = 60  // fps
          , slider = this
          , iterations = slider.knobAnimationDuration / 1000 *
                          KNOB_ANIMATION_FRAME_RATE
          , interval;

      interval = setInterval( function (e) {
         if (slider.animatingKnob) {
            slider.knobPercent = startPercent +
                ((endPercent - startPercent) / iterations * count++);

            slider.knobPercent = slider.knobPercent > 1.0 ?
                                 1.0 : slider.knobPercent;

            slider.knobPercent = slider.knobPercent < 0 ?
                                 0 : slider.knobPercent;

            if (count > 1) {
               slider.fireChangeEvent(e);
            }
         }
         else { // Done animating knob 
            slider.knobPercent = endPercent;
            slider.draggingKnob = false;
            clearInterval(interval);
            count = 0;
         }
      }, slider.knobAnimationDuration / iterations);
   },

   activateKnobAnimation: function () {
      var transitionString = "margin-left " +
          (this.knobAnimationDuration / 1000).toFixed(1) + "s";

      this.knobCanvas.style.webkitTransition = transitionString;
      this.knobCanvas.style.MozTransition = transitionString;
      this.knobCanvas.style.OTransition = transitionString;
   },

   deactivateKnobAnimation: function () {
      this.knobCanvas.style.webkitTransition = "margin-left 0s";
      this.knobCanvas.style.MozTransition = "margin-left 0s";
      this.knobCanvas.style.OTransition = "margin-left 0s";
   },
   
   addMouseListeners: function () {
      var slider = this; // Let event handlers access this object

      this.knobCanvas.addEventListener('mousedown', function(e) {
         slider.draggingKnob = true;
         e.preventDefault();
      });
      
      this.railCanvas.onmousedown = function(e) {
         var   mouse = slider.windowToCanvas(e.clientX, e.clientY)
             , startPercent
             , endPercent;

         e.preventDefault();

         slider.knobPercent = slider.knobPositionToPercent(mouse.x);

         startPercent = slider.knobPercent;
         endPercent = slider.knobPositionToPercent(mouse.x);
         slider.animatingKnob = true;

         slider.trackKnobAnimation(startPercent, endPercent);

         slider.knobPercent = endPercent;
         slider.erase();
         slider.draw();
      };
      
      this.knobCanvas.addEventListener('mousemove', function(e) {
         var mouse = null,
             percent = null;

         e.preventDefault();

         if (slider.draggingKnob) {
            slider.deactivateKnobAnimation();
            
            mouse = slider.windowToCanvas(e.clientX, e.clientY);
            percent = slider.knobPositionToPercent(mouse.x);

            if (percent >= 0 && percent <= 1.0) {
               slider.fireChangeEvent(e);
               slider.erase();
               slider.draw(percent);
            }
         }
      }, false);
      
      this.knobCanvas.addEventListener('mouseup', function(e) {
         var mouse = null;

         e.preventDefault();

         if (slider.draggingKnob) {
            slider.draggingKnob = false;
            slider.animatingKnob = false;
            slider.activateKnobAnimation();
         }
      }, false);
   }, 

   addKnobTransitionListeners: function () {
      var BROWSER_PREFIXES = [ 'webkit', 'o' ],
          slider = this; // Let event handlers access this object

      for (var i=0; i < BROWSER_PREFIXES.length; ++i) {
         this.knobCanvas.addEventListener(
            BROWSER_PREFIXES[0] + "TransitionEnd", 

            function (e) {
               slider.animatingKnob = false;
            }
         );
      }

      this.knobCanvas.addEventListener("transitionend", // Mozilla
            function (e) {
               slider.animatingKnob = false;
            }
      );
   },      

   // Change Events...................................................

   fireChangeEvent: function(e) {
      for (var i=0; i < this.changeEventListeners.length; ++i) {
         this.changeEventListeners[i](e);
      }
   },

   addChangeListener: function (listenerFunction) {
      this.changeEventListeners.push(listenerFunction);
   },
   
   // Utility Functions...............................................

   mouseInKnob: function(mouse) { 
      var position = this.knobPercentToPosition(this.knobPercent);
      this.railContext.beginPath();
      this.railContext.arc(position, this.railCanvas.height/2,
                       this.knobRadius, 0, Math.PI*2);

      return this.railContext.isPointInPath(mouse.x, mouse.y);
   },

   mouseInRail: function(mouse) {
      this.railContext.beginPath();
      this.railContext.rect(this.left, 0,
         this.right - this.left, this.bottom);

      return this.railContext.isPointInPath(mouse.x, mouse.y);
   },
    
   windowToCanvas: function(x, y) {
      var bbox = this.railCanvas.getBoundingClientRect();

      return {
         x: x - bbox.left * (this.railCanvas.width  / bbox.width),
         y: y - bbox.top  * (this.railCanvas.height / bbox.height)
      };
   },

   knobPositionToPercent: function(position) {
      var railWidth = this.right - this.left - 2*this.knobRadius;
          percent = (position - this.left - this.knobRadius) / railWidth;

      percent = percent > 1.0 ? 1.0 : percent;
      percent = percent < 0 ? 0 : percent;

      return percent;
   },
   
   knobPercentToPosition: function(percent) {
      if (percent > 1) percent = 1;
      if (percent < 0) percent = 0;
      var railWidth = this.right - this.left - 2*this.knobRadius;
      return percent * railWidth + this.left + this.knobRadius;
   },

   // Drawing Functions...............................................

   moveKnob: function (position) {
      this.knobCanvas.style.marginLeft = position - this.knobCanvas.width/2 + "px";
   },
   
   fillKnob: function () {
      this.knobContext.save();

      this.knobContext.beginPath();

      this.knobContext.arc(this.knobCanvas.width/2, this.knobCanvas.height/2,
                       this.knobCanvas.width/2-2, 0, Math.PI*2, false);

      this.knobContext.clip();

      this.knobContext.fillStyle = this.KNOB_FILL_STYLE;
      this.knobContext.fill();

      this.knobContext.restore();
   },

   strokeKnob: function () {
      this.knobContext.save();

      this.knobContext.lineWidth = 1;
      this.knobContext.strokeStyle = this.KNOB_STROKE_STYLE;
      this.knobContext.stroke();

      this.knobContext.restore();
   },

   drawKnob: function (percent) {
      if (percent < 0) percent = 0;
      if (percent > 1) percent = 1;

      this.knobPercent = percent;
      this.moveKnob(this.knobPercentToPosition(percent));
      this.fillKnob();
      this.strokeKnob();
   },
   
   drawRail: function () {
      var radius = (this.bottom - this.top) / 2;

      this.railContext.save();
      
	   this.railContext.shadowColor   = this.SHADOW_COLOR;
	   this.railContext.shadowOffsetX = this.SHADOW_OFFSET_X;
	   this.railContext.shadowOffsetY = this.SHADOW_OFFSET_Y;
	   this.railContext.shadowBlur = this.SHADOW_BLUR;

		this.railContext.beginPath();
      this.railContext.moveTo(this.left + radius, this.top);
      this.railContext.arcTo(this.right, this.top, this.right, this.bottom, radius);
      this.railContext.arcTo(this.right, this.bottom, this.left, this.bottom, radius);
      this.railContext.arcTo(this.left, this.bottom, this.left, this.top, radius);
      this.railContext.arcTo(this.left, this.top, this.right, this.top, radius);
      this.railContext.closePath();

      this.railContext.fillStyle = this.fillStyle;
		this.railContext.fill();
	   this.railContext.shadowColor = undefined;
      this.railContext.restore();

      this.overlayRailGradient();

		this.railContext.restore();
   },

   overlayRailGradient: function () {
      var gradient =
         this.railContext.createLinearGradient(this.left, this.top,
                                           this.left, this.bottom);

      gradient.addColorStop(0,    'rgba(255,255,255,0.4)');
      gradient.addColorStop(0.2,  'rgba(255,255,255,0.6)');
      gradient.addColorStop(0.25, 'rgba(255,255,255,0.7)');
      gradient.addColorStop(0.3,  'rgba(255,255,255,0.9)');
      gradient.addColorStop(0.40, 'rgba(255,255,255,0.7)');
      gradient.addColorStop(0.45, 'rgba(255,255,255,0.6)');
      gradient.addColorStop(0.60, 'rgba(255,255,255,0.4)');
      gradient.addColorStop(1,    'rgba(255,255,255,0.1)');

      this.railContext.fillStyle = gradient;
		this.railContext.fill();

      this.railContext.lineWidth = 0.4;
      this.railContext.strokeStyle = this.strokeStyle;
      this.railContext.stroke();
   },
   
   draw: function (percent) {
      this.drawRail();
      this.drawKnob(percent === undefined ? this.knobPercent : percent);
   },

   erase: function() {
      this.railContext.clearRect(
         this.left - this.knobRadius, 0 - this.knobRadius,
         this.railCanvas.width  + 4*this.knobRadius,
         this.railCanvas.height + 3*this.knobRadius);

      this.knobContext.clearRect(0, 0, this.knobCanvas.width,
                                       this.knobCanvas.height);
   },

   redraw: function (percent) {
      this.erase();
      this.draw(percent);
   }
};
