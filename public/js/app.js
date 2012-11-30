var app = app || {};
app.views = {};
app.models = {};
app.collections = {};
app.templates = {};
app.config = {};

this["app"] = this["app"] || {};
this["app"]["templates"] = this["app"]["templates"] || {};

this["app"]["templates"]["intro"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div>\n  This is how this works.\n</div>\n";};
(function () {
  app.models.AudioInput = Backbone.Model.extend({

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
      console.log(this.fft.spectrum[0]);
      this.detectSound( this.fft.spectrum );
    },

    detectSound : function ( signal ) {
      var centroid;

      if ( this.wait > 0) { return; }

      centroid = this.spectralCentroid( signal );
      if ( centroid > 0 ) {
        console.log( 'Centroid: ' + centroid );
      }
      if ( centroid < 500 ) {
        this.wait = 1;
        console.log('kick');
        this.trigger( 'kick' );
      } else if ( centroid > 700 && centroid < 5000 ) {
        console.log('snare');
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
      console.log(sumFX,sumX);
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

(function () {
  app.models.Sample = Backbone.Model.extend({

    PATH_ROOT : 'audio/',

    // Initialize with samplePath, audioInput, context, and trigger name
    initialize : function () {
      this.samplePath = this.get( 'samplePath' );
      this.audioInput = this.get( 'audioInput' );
      this.context = this.get( 'context' );
      this.triggerName = this.get( 'triggerName' );

      this.loadSample();
      this.audioInput.on( this.triggerName, this.play, this );
    },

    setSample : function ( path ) {
      this.samplePath = path;
      this.loadSample();
    },

    loadSample : function () {
      var that = this;
      allen.getBuffer( this.PATH_ROOT + this.samplePath, function ( e ) {
        that.buffer = that.context.createBuffer( e.target.response, false );
        that.trigger( 'loaded' );
      });
    },

    play : function () {
      console.log( 'playing ' + this.triggerName );
      this.bufferNode = this.context.createBufferSource();
      this.bufferNode.buffer = this.buffer;
      this.bufferNode.connect( this.context.destination );
      this.bufferNode.noteOn( 0 );
    }

  });
})();

(function () {
  app.views.View = Backbone.View.extend({

    render : function () {
      this.template = this.template ||
        Handlebars.template( app.templates[ this.name ]);

      var data = this.getRenderData ? this.getRenderData() : {};
      this.$el.html( this.template( data ));
      console.log(this.$el.html());
      return this;
    }

  });
})();

(function () {
  app.views.Intro = app.views.View.extend({

    name : 'intro',

    className : 'intro-view',

    initialize : function ( options ) {

    }

  });
})();

app.init = function () {
  app.introView = new app.views.Intro();

  app.context = allen.getAudioContext();
  app.audioInput = new app.models.AudioInput({
    context : app.context
  });

  app.snareSample = new app.models.Sample({
    context : app.context,
    audioInput : app.audioInput,
    samplePath : 'rock_snare.wav',
    triggerName : 'snare'
  });

  app.kickSample = new app.models.Sample({
    context : app.context,
    audioInput : app.audioInput,
    samplePath : 'rock_kick.wav',
    triggerName : 'kick'
  });

  $( '#content' )
    .append( app.introView.render().$el );
};

$(function () {
  app.init.call( app );
//  Backbone.history.start();
});
