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
