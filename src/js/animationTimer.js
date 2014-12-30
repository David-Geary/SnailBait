var AnimationTimer = function (duration, easingFunction)  {
   this.easingFunction = easingFunction;
   
   if (duration !== undefined) this.duration = duration;
   else                        this.duration = 1000;

   this.stopwatch = new Stopwatch();
};

AnimationTimer.prototype = {
   start: function (now) {
      this.stopwatch.start(now);
   },

   stop: function (now) {
      this.stopwatch.stop(now);
   },

   pause: function (now) {
      this.stopwatch.pause(now);
   },

   unpause: function (now) {
      this.stopwatch.unpause(now);
   },

   isPaused: function () {
      return this.stopwatch.isPaused();
   },
   
   getElapsedTime: function (now) {
      var elapsedTime = this.stopwatch.getElapsedTime(now),
          percentComplete = elapsedTime / this.duration;

      if (this.easingFunction === undefined || 
          percentComplete === 0 ||
          percentComplete > 1) {
         return elapsedTime;
      }

      return elapsedTime * 
             (this.easingFunction(percentComplete) / percentComplete);
   },

   isRunning: function() {
      return this.stopwatch.running;
   },
   
   isExpired: function (now) {
      return this.stopwatch.getElapsedTime(now) > this.duration;
   },

   reset: function(now) {
      this.stopwatch.reset(now);
   }
};

AnimationTimer.makeEaseOutEasingFunction = function (strength) {
   return function (percentComplete) {
      return 1 - Math.pow(1 - percentComplete, strength*2);
   };
};

AnimationTimer.makeEaseInEasingFunction = function (strength) {
   return function (percentComplete) {
      return Math.pow(percentComplete, strength*2);
   };
};

AnimationTimer.makeEaseOutInEasingFunction = function () {
   return function (percentComplete) {
      return percentComplete + 
             Math.sin(percentComplete*2*Math.PI) / (2*Math.PI);
   };
};

AnimationTimer.makeEaseInOutEasingFunction = function () {
   return function (percentComplete) {
      return percentComplete - 
             Math.sin(percentComplete*2*Math.PI) / (2*Math.PI);
   };
};

AnimationTimer.makeLinearEasingFunction = function () {
   return function (percentComplete) {
      return percentComplete;
   };
};
