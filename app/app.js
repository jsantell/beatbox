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
