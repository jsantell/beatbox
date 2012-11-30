(function () {
  app.models.VideoInput = Backbone.Model.extend({
    REFRESH_RATE : 250,
    initialize : function () {
      var that = this;
      this.canvasEl = this.get( 'canvas' );
      this.height = this.canvasEl.height;
      this.width = this.canvasEl.width;
      this.videoEl = this.get( 'video' );
      this.context = this.canvasEl.getContext( '2d' );
      this.totalArea = this.height * this.width;

      this.tracker = new HT.Tracker({ fast: false });

      navigator.getUserMedia({ video: true }, function ( stream ) {
        that.videoReady.call( that, stream );
      });
    },

    videoReady : function ( stream ) {
      var that = this, image;

      // TODO Use non-webkit version
      this.videoEl.src = window.webkitURL.createObjectURL( stream );

      setInterval(function () {
        if ( that.videoEl.readyState === that.videoEl.HAVE_ENOUGH_DATA ) {
          that.context.drawImage( that.videoEl, 0, 0, that.width, that.height );
          image = that.context.getImageData( 0, 0, that.width, that.height );
          // Process candidate with hand tracker
          that.processVideoFrame( that.tracker.detect( image ));
        }
      }, this.REFRESH_RATE );
    },

    processVideoFrame : function ( frame ) {
      var color = "red", avgX, avgY, pos, area, hull, len, i = 0, sumX, sumY,
        context = this.context;
      if ( frame ) {
        hull = frame.hull;
        len = hull.length;

        if ( len ) {
          context.beginPath();
          context.strokeStyle = color;
          context.moveTo( hull[ 0 ].x, hull[ 0 ].y );
          for (; i < len; ++i ) {
            context.lineTo( hull[ i ].x, hull[ i ].y );
          }
          context.stroke();
          context.closePath();
        }

        sumX = hull[ 0 ].x;
        sumY = hull[ 0 ].y;
        i = 1;
        for (; i < len; ++i ) {
          sumX += hull[ i ].x;
          sumY += hull[ i ].y;
        }

        pos = this.calcHandPosition( sumX / len, sumY / len );
//        area = this.calcHandArea( hull );
      }
    },

    calcHandPosition : function ( x, y ) {
      var pos = {
        x : x,
        y : y
      };
      this.trigger( 'position', pos );
      return pos;
    }

  });
})();
