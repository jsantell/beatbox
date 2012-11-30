var app = app || {};
app.views = {};
app.models = {};
app.collections = {};
app.templates = {};
app.config = {};

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

this["app"] = this["app"] || {};
this["app"]["templates"] = this["app"]["templates"] || {};

this["app"]["templates"]["controls"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"controls-view\">\n  <select class=\"kit-select\">\n    <option value=\"rock\">Rock Kit</option>\n    <option value=\"hiphop\">Hip-hop Kit</option>\n    <option value=\"insane\">Insane Kit</option>\n  </select>\n</div>\n";};

this["app"]["templates"]["intro"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div>\n  This is how this works.\n</div>\n";};

this["app"]["templates"]["video"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<video id=\"video\" autoplay=\"true\"></video>\n<canvas id=\"canvas\"></canvas>\n";};
(function () {
  app.models.AudioInput = Backbone.Model.extend({

    KICK : { low: 0, high: 500 },
    SNARE : { low: 1000, high: 5000 },
    THRESHOLD : 0.15,
    BUFFER_SIZE : 1024,
    DECAY : 0.12,

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
      if ( centroid >= this.KICK.low && centroid <= this.KICK.high ) {
        this.wait = 1;
        this.trigger( 'kick' );
      } else if ( centroid >= this.SNARE.low && centroid <= this.SNARE.high ) {
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

(function () {
  app.models.Effect = Backbone.Model.extend({

    // Initialize with 
    initialize : function () {
      this.node = this.get( 'node' );
    },

    connect : function ( effect ) {
      this.node.connect( effect.node );
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
      this.destination = this.get( 'destination' );

      this.loadSample();
      this.audioInput.on( this.triggerName, this.play, this );
    },

    setKit : function ( kit ) {
      this.setSample( kit + '_' + this.triggerName + '.wav' );
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
      this.bufferNode.connect( this.destination );
      this.bufferNode.noteOn( 0 );
    }

  });
})();

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
  app.views.Controls = app.views.View.extend({

    name : 'controls',

    className : 'controls-view',

    events : {
      'change .kit-select' : 'handleKitSelect'
    },
 
    initialize : function ( options ) {
      this.samples = options.samples;
    },

    setKit : function ( kit ) {
      _.each( this.samples, function ( sample ) {
        sample.setKit( kit );
      });
    },

    handleKitSelect : function ( e ) {
      this.setKit( $(e.target).val() );
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

(function () {
  app.views.Video = app.views.View.extend({

    name : 'video',

    className : 'video-view',

    initialize : function ( options ) {

    }

  });
})();

app.init = function () {

  app.introView = new app.views.Intro();
  app.videoView = new app.views.Video();

  $( '#content' )
    .append( app.introView.render().$el )
    .append( app.videoView.render().$el );

  app.context = allen.getAudioContext();
  app.audioInput = new app.models.AudioInput({
    context : app.context
  });

  app.videoInput = new app.models.VideoInput({
    canvas : document.getElementsByTagName( 'canvas' )[0],
    video : document.getElementsByTagName( 'video' )[0]
  });

  app.sampleDestination = app.context.createGainNode();

  app.snareSample = new app.models.Sample({
    context : app.context,
    destination : app.sampleDestination,
    audioInput : app.audioInput,
    samplePath : 'rock_snare.wav',
    triggerName : 'snare'
  });

  app.kickSample = new app.models.Sample({
    context : app.context,
    destination : app.sampleDestination,
    audioInput : app.audioInput,
    samplePath : 'rock_kick.wav',
    triggerName : 'kick'
  });

  app.controlsView = new app.views.Controls({
    samples : [ app.snareSample, app.kickSample ]
  });
  
  $( '#content' ).prepend( app.controlsView.render().$el );
  
  var
//    distortion = app.context.createWaveShaper(),
    compressor = app.context.createDynamicsCompressor(),
    filter = app.context.createBiquadFilter(),
    reverb = new SimpleReverb( app.context, { decay: 10, seconds: 3 }),
    reverbGain = app.context.createGain();

  // Distortion
/*  var wave = new Float32Array(256);
  for ( var i = 0; i < wave.length; i++ ) {
    wave[ i ] = Math.log( i ) / Math.log( wave.length );
  }
  distortion.curve = wave;
  app.distortion = new app.models.Effect({ node: distortion });
*/

  // Filter
  filter.frequency.value = 22100;
  filter.type.value = 1;
  filter.Q.value = 4;

  // Compressor
  compressor.threshold.value = -6;
  compressor.knee.value = 10;
  compressor.ratio.value = 15;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.5;

  reverbGain.gain.value = 0.6;

  app.compressor = new app.models.Effect({ node: compressor });
  app.filter = new app.models.Effect({ node: filter });

  // Bind video callback to filter
  var height = document.getElementsByTagName( 'canvas' )[0].height;
  app.videoInput.on( 'position', function ( pos ) {
    var y = (( pos.y / height ) * 5000 ) + 20;
    app.filter.node.frequency.value = y; 
  });

  app.sampleDestination.connect( app.filter.node );
  //app.sampleDestination.connect( app.distortion.node );
//  app.distortion.connect( app.compressor );
  app.filter.connect( app.compressor );
  app.compressor.node.connect( reverb.input );
  app.compressor.node.connect( app.context.destination );
  reverb.connect( reverbGain );
  reverbGain.connect( app.context.destination );

  setInterval(function () {
//    app.audioInput.trigger('snare');
  }, 100);
};

$(function () {
  app.init.call( app );
//  Backbone.history.start();
});
