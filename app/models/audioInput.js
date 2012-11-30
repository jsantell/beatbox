(function () {
  app.models.AudioInput = Backbone.Model.extend({

    THRESHOLD : 0.15,
    BUFFER_SIZE : 2048,
    DECAY : 0.25,

    initialize : function () {
      var that = this;

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
      this.wait -= this.decay;
      this.fft.forward( e.inputBuffer.getChannelData( 0 ));
      this.detectSound( this.fft.spectrum );
    },

    detectSound : function ( signal ) {
      var centroid;

      if ( wait > 0) { return; }

      centroid = this.spectralCentroid( signal );
      if ( centroid > 0 ) {
        console.log( 'Centroid: ' + centroid );
      }
      if ( centroid < 500 ) {
        this.trigger( 'kick' );
      } else if ( centroid > 700 && centroid < 5000 ) {
        this.trigger( 'snare' );
      }
    },

    spectralCentroid : function ( signal ) {
      var xn, fn;
      for ( var n = 0; n < signal.length; n++ ) {
        xn = Math.abs( signal[ n ] ) < this.THRESHOLD ? 0 : signal[ n ];
      }
      fn = nToFreq( n, bufferSize, this.context.sampleRate );
      return ( fn * xn ) / xn;
    },

    preCalcNToF : function ( bufferSize, sampleRate ) {
      var nToFPre = [];
      for ( var i = 0; i < bufferSize; i++ ) {
        nToFPre = this.nToFreq( i, bufferSize, sampleRate );
      }
      return nToFPre;
    },

    nToFreq : function ( n, bufferSize, sampleRate ) {
      return n * sampleRate / bufferSize;
    }

  });
})();
