module.exports = function(grunt) {
  
  grunt.initConfig({
    stylus: {
      compile: {
        files: {
          'public/css/app.css' : 'app/styles/*.styl'
        }
      }
    },
    less: {
      compile: {
        files: {
          'public/css/lib.css' : './components/bootstrap/less/bootstrap.less'
        }
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: 'app.templates',
          processName: function ( name ) {
            return name.split('/').pop().match(/^(.*)\.hbs$/)[1];
          }
        },
        files: {
          'public/js/templates.js' : 'app/templates/*.hbs'
        }
      }
    },
    concat: {
      jslib: {
        src: [
          './components/jquery/jquery.js',
          './components/dsp.js/dsp.js',
          './components/allen/allen.js',
          './components/underscore/underscore.js',
          './components/backbone/backbone.js',
          './components/handlebars/handlebars-1.0.0-rc.1.js'
        ],
        dest: 'public/js/lib.js'
      },
      jsapp: {
        src: [
          './app/setup.js',
          './public/js/templates.js',
          './app/models/*.js',
          './app/collections/*.js',
          './app/routes/*.js',
          './app/views/View.js',
          './app/views/*.js',
          './app/app.js'
        ],
        dest: 'public/js/app.js'
      }
    },
    min: {
      jsapp: {
        src: 'public/js/app.js',
        dest: 'public/js/app.min.js'
      },
      jslib: {
        src: 'public/js/lib.js',
        dest: 'public/js/lib.min.js'
      }
    },
    watch: {
      scripts: {
        files: [
          'app/*.js',
          'app/models/*.js',
          'app/collections/*.js',
          'app/routes/*.js',
          'app/views/*.js',
          'app/templates/*.hbs',
          'app/styles/*.styl'
        ],
        tasks: 'less stylus handlebars concat min'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib');
  grunt.registerTask('default', 'less stylus handlebars concat min');

};
