var PulseBehavior = function (duration, opacityThreshold) {
   this.duration = duration || 1000;
   this.opacityThreshold = opacityThreshold || 0;

   this.timer = 
      new AnimationTimer(this.duration,
                         AnimationTimer.makeEaseInOutEasingFunction());
   this.paused = false;
   this.pulsating = false;
};

PulseBehavior.prototype = {
   pause: function(sprite, now) {
      if (!this.timer.isPaused()) {
         this.timer.pause(now);
      }
      this.paused = true;
   },

   unpause: function(sprite, now) {
      if (this.timer.isPaused()) {
         this.timer.unpause(now);
      }

      this.paused = false;
   },
      
   dim: function (sprite, elapsed) {
      sprite.opacity = 1 - ((1 - this.opacityThreshold) *
                            (parseFloat(elapsed) / this.duration));
   },

   brighten: function (sprite, elapsed) {
      sprite.opacity += (1 - this.opacityThreshold) *
                         parseFloat(elapsed) / this.duration;
   },
   
   startPulsing: function (sprite) {
      this.pulsating = true;
      this.timer.start();
   },

   resetTimer: function () {
      this.timer.stop();
      this.timer.reset();
      this.timer.start();
   },
      
   execute: function (sprite, now, fps, context, 
                      lastAnimationFrameTime) {
      var elapsed;

      if (!this.pulsating) {
         this.startPulsing(sprite);
      }
      else {
         elapsed = this.timer.getElapsedTime();

         if (this.timer.isExpired()) {
            this.resetTimer();
            return;
         }
        
         if (elapsed < this.duration/2) {
            this.dim(sprite, elapsed);
         } 
         else {
            this.brighten(sprite, elapsed);
         }
      }
   }
};
