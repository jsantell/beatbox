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