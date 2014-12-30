var BounceBehavior = function (duration, height) {
   this.duration = duration || 1000;
   this.distance = height*2 || 100;
   this.bouncing = false;

   this.timer = 
      new AnimationTimer(this.duration,
                         AnimationTimer.makeEaseOutInEasingFunction());

   this.paused = false;
};

BounceBehavior.prototype = {
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
   
   startBouncing: function (sprite, now) {
      this.baseline = sprite.top;
      this.bouncing = true;
      this.timer.start(now);
   },

   resetTimer: function (now) {
      this.timer.stop(now);
      this.timer.reset(now);
      this.timer.start(now);
   },

   adjustVerticalPosition: function (sprite, elapsed, now) {
      var rising = false,
          deltaY = this.timer.getElapsedTime(now) / this.duration *
                   this.distance;

      if (elapsed < this.duration/2)
         rising = true;

      if (rising) {
         // Subtracting deltaY moves the sprite up
         sprite.top = this.baseline - deltaY;
      }
      else {
         // Move the sprite down
         sprite.top = this.baseline - this.distance + deltaY;
      }
   },

   execute: function (sprite, now, fps, context,
                      lastAnimationFrameTime) {
      var elapsed,
          deltaY;

      if (!this.bouncing) {
         this.startBouncing(sprite, now);
      }
      else {
         elapsed = this.timer.getElapsedTime(now);

         if (this.timer.isExpired(now)) {
            this.resetTimer(now);
            return;
         }

         this.adjustVerticalPosition(sprite, elapsed, now);
      }
   }
};
