// Sprite Artists......................................................

// Artists draw sprites with a draw(sprite, context) method.

SpriteSheetArtist = function (spritesheet, cells) {
   this.cells = cells;
   this.spritesheet = spritesheet;
   this.cellIndex = 0;
};

SpriteSheetArtist.prototype = {
   draw: function (sprite, context) {
      var cell = this.cells[this.cellIndex];

      context.drawImage(this.spritesheet, cell.left, cell.top,
                                          cell.width, cell.height,
                                          sprite.left, sprite.top,
                                          cell.width, cell.height);
   },

   advance: function () {
      if (this.cellIndex === this.cells.length-1) {
         this.cellIndex = 0;
      }
      else {
         this.cellIndex++;
      }
   }
};

// Sprites............................................................

// Sprites have a type, an artist, and an array of behaviors. Sprites 
// can be updated and drawn.
//
// A sprite's artist draws the sprite: draw(sprite, context)
// A sprite's behavior executes: execute(sprite, time, fps)

var Sprite = function (type, artist, behaviors) {
   var DEFAULT_WIDTH = 10,
       DEFAULT_HEIGHT = 10,
       DEFAULT_OPACITY = 1.0;

   this.artist    = artist;
   this.type      = type;
   this.behaviors = behaviors || [];

   this.hOffset   = 0; // Horizontal offset
   this.left      = 0;
   this.top       = 0;
   this.width     = DEFAULT_WIDTH;
   this.height    = DEFAULT_HEIGHT;
   this.velocityX = 0;
   this.velocityY = 0;
   this.opacity   = DEFAULT_OPACITY;
   this.visible   = true;

   this.showCollisionRectangle = false;

   this.collisionMargin = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
   };
};

Sprite.prototype = {
   calculateCollisionRectangle: function () {
      // Return an object with properties left, right, top, and bottom

      return {
         left:   this.left - this.hOffset + this.collisionMargin.left,

         right:  this.left - this.hOffset + 
                 this.width - this.collisionMargin.right,

         top:    this.top + this.collisionMargin.top,

         bottom: this.top + this.collisionMargin.top + 
                 this.height - this.collisionMargin.bottom,

         centerX: this.left + this.width/2,

         centerY: this.top + this.height/2
      }
   },

   drawCollisionRectangle: function (context) {
      var COLLISION_RECTANGLE_COLOR      = 'white', 
          COLLISION_RECTANGLE_LINE_WIDTH = 2.0,
          r = this.calculateCollisionRectangle();

      context.save();

      context.beginPath();

      context.strokeStyle = COLLISION_RECTANGLE_COLOR;
      context.lineWidth   = COLLISION_RECTANGLE_LINE_WIDTH;

      context.strokeRect(r.left + this.hOffset, r.top, 
                         r.right - r.left, r.bottom - r.top);

      context.restore(); // resets strokeStyle and lineWidth
   },

   draw: function (context) {
      context.save();

      context.globalAlpha = this.opacity;
      
      if (this.visible && this.artist) {
         this.artist.draw(this, context);
      }
 
      if (this.showCollisionRectangle) {
         this.drawCollisionRectangle(context);
      }

      context.restore(); // resets globalAlpha
   },

   update: function (now, fps, context, lastAnimationFrameTime) {
      for (var i = 0; i < this.behaviors.length; ++i) {
         this.behaviors[i].execute(this, 
                                   now, 
                                   fps, 
                                   context, 
                                   lastAnimationFrameTime);
      }
   },
};
