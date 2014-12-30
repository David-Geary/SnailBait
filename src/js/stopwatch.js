// Stopwatch..................................................................
//
// Like the real thing, you can start and stop a stopwatch, and you can
// find out the elapsed time the stopwatch has been running. After you stop
// a stopwatch, it's getElapsedTime() method returns the elapsed time
// between the start and stop.

var Stopwatch = function ()  {
   this.startTime = 0;
   this.running = false;
   this.elapsed = undefined;

   this.paused = false;
   this.startPause = 0;
   this.totalPausedTime = 0;   
};

Stopwatch.prototype = {
   start: function (now) {
      this.startTime = now ? now : +new Date();
      this.elapsedTime = undefined;
      this.running = true;
      this.totalPausedTime = 0;
      this.startPause = 0;
   },

   stop: function (now) {
      if (this.paused) {
         this.unpause();
      }
      
      this.elapsed = (now ? now : +new Date()) - 
                      this.startTime - 
                      this.totalPausedTime;
      this.running = false;
   },

   pause: function (now) {
      if (this.paused) {
         return;
      }

      this.startPause = now ? now : +new Date(); 
      this.paused = true;
   },

   unpause: function (now) {
      if (!this.paused) {
         return;
      }

      this.totalPausedTime += (now ? now : +new Date()) - 
                              this.startPause; 
      this.startPause = 0;
      this.paused = false;
   },

   isPaused: function () {
      return this.paused;
   },
   
   getElapsedTime: function (now) {
      if (this.running) {
         return (now ? now : +new Date()) - 
                 this.startTime - 
                 this.totalPausedTime;
      }
      else {
        return this.elapsed;
      }
   },

   isRunning: function() {
      return this.running;
   },

   reset: function(now) {
     this.elapsed = 0;
     this.startTime = now ? now : +new Date();
     this.elapsedTime = undefined;
     this.running = false;
   }
};