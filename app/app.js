app.init = function () {
  app.introView = new app.views.Intro();

  app.context = allen.getAudioContext();
  app.input = new app.models.Input();

  $( '#content' )
    .append( app.introView.render().$el );
};

$(function () {
  app.init.call( app );
//  Backbone.history.start();
});
