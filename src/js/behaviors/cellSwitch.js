var CellSwitchBehavior = function (cells, duration, trigger, callback) {
   this.cells = cells;
   this.duration = duration || 1000;
   this.trigger = trigger;
   this.callback = callback;
};

CellSwitchBehavior.prototype = {
   switchCells: function (sprite, now) {
      sprite.originalCells = sprite.artist.cells;
      sprite.originalIndex = sprite.artist.cellIndex;

      sprite.switchStartTime = now;

      sprite.artist.cells = this.cells;
      sprite.artist.cellIndex = 0;
   },

   revert: function (sprite, now) {
      sprite.artist.cells = sprite.originalCells;
      sprite.artist.cellIndex = sprite.originalIndex;
  
      if (this.callback) {
         this.callback(sprite, this);
      }
   },

   execute: function(sprite, now, fps, context, 
                     lastAnimationFrameTime) {
      if (this.trigger && 
          this.trigger(sprite, now, fps, lastAnimationFrameTime)) {
      
         if (sprite.artist.cells !== this.cells) {
            this.switchCells(sprite, now);
         }
         else if (now - sprite.switchStartTime > this.duration) {
            this.revert(sprite, now);
         }
      }
   }
};