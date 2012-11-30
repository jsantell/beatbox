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
