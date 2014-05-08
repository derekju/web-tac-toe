module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                curly: true,
                indent: 4,
                latedef: true,
                quotmark: true,
                trailing: true,
                ignores: ['app/public/js/thirdparty/*']
            },            
            all: ['Gruntfile.js', 'app/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint']);
};