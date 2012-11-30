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
