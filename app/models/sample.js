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
