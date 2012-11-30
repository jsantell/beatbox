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
