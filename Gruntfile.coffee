module.exports = (grunt) ->
  concatenatedScriptSources = [
    'source/js/Utils.js',
    'source/js/VertexSort.js',
    'source/js/ParticlePool.js',
    'source/js/Scene.js',
    'source/js/AbstractTarget.js',
    'source/js/ImageTarget.js',
    'source/js/ModelTarget.js',
    'source/js/MultiTarget.js'
  ]
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files: [
          expand: true,
          cwd: 'source/coffee'
          src: ['**/*.coffee']
          dest: 'source/js'
          ext: '.js'
        ]
    watch:
      coffee:
        files: ['source/coffee/**/*.coffee']
        tasks: 'default'
    concat:
      options:
        separator: ';'
      build:
        src: concatenatedScriptSources
        dest: 'deploy/particlesaga.js'
    uglify:
      options:
        preserveComments: 'some'
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      deploy:
        files:
          'deploy/particlesaga.min.js': ['<%= concat.build.dest %>']

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.registerTask('default', ['coffee', 'concat'])
  grunt.registerTask('deploy', ['default', 'uglify'])
