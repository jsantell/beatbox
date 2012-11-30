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
