app.init = function () {
  app.introView = new app.views.Intro();

  app.context = allen.getAudioContext();
  app.audioInput = new app.models.AudioInput({
    context : app.context
  });

  $( '#content' )
    .append( app.introView.render().$el );
};

$(function () {
  app.init.call( app );
//  Backbone.history.start();
});
