(function () {
  app.models.AudioInput = Backbone.Model.extend({

    KICK : { low: 0, high: 500 },
    SNARE : { low: 700, high: 5000 },
    THRESHOLD : 0.15,
    BUFFER_SIZE : 2048,
    DECAY : 0.25,

    initialize : function () {
      var that = this;
      this.context = this.get( 'context');
      this.wait = 0;

      navigator.webkitGetUserMedia({ audio: true }, function ( stream ) {
        that.fft = new FFT( that.BUFFER_SIZE, that.context.sampleRate );
        that.sourceNode = that.context.createMediaStreamSource( stream );
        that.procNode = that.context.createJavaScriptNode( that.BUFFER_SIZE, 1, 1 );

        that.sourceNode.connect( that.procNode );
        that.procNode.onaudioprocess = function ( e ) {
          that.processAudio.call( that, e );
        };
        that.procNode.connect( that.context.destination );
      });
    },

    processAudio : function ( e ) {
      this.wait -= this.DECAY;
      this.fft.forward( e.inputBuffer.getChannelData( 0 ));
      this.detectSound( this.fft.spectrum );
    },

    detectSound : function ( signal ) {
      var centroid;

      if ( this.wait > 0) { return; }

      centroid = this.spectralCentroid( signal );
      if ( centroid > 0 ) {
        console.log( 'Centroid: ' + centroid );
      }
      if ( centroid >= KICK.low && centroid <= KICK.high ) {
        this.wait = 1;
        this.trigger( 'kick' );
      } else if ( centroid >= SNARE.low && centroid <= SNARE.high ) {
        this.wait = 1;
        this.trigger( 'snare' );
      }
    },

    spectralCentroid : function ( signal ) {
      var xn, fn, sumFX = 0, sumX = 0;

      for ( var n = 0; n < signal.length; n++ ) {
        xn = Math.abs( signal[ n ] ) < this.THRESHOLD ? 0 : signal[ n ];
        fn = this.nToFreq( n, this.context.sampleRate );
        sumFX += fn * xn;
        sumX += xn;
      }
      return sumFX / sumX;
    },

    preCalcNToF : function ( sampleRate ) {
      var nToFPre = [];
      for ( var i = 0; i < this.BUFFER_SIZE; i++ ) {
        nToFPre = this.nToFreq( i, sampleRate );
      }
      return nToFPre;
    },

    nToFreq : function ( n, sampleRate ) {
      return n * sampleRate / this.BUFFER_SIZE;
    }

  });
})();
