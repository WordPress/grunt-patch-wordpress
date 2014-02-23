# grunt-patch-wordpress

[![Build Status](https://travis-ci.org/aaronjorbin/grunt-patch-wordpress.png?branch=master)](https://travis-ci.org/aaronjorbin/grunt-patch-wordpress)

> Patch your develop-wordpress directory like a boss (also works on other trac based projects)

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
  npm install grunt-patch-wordpress --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-patch-wordpress');
```

## The "patch_wordpress" task
```js
patch_wordpress{
  tracUrl: 'core.trac.wordpress.org'
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- 0.1.0 - Initial Release
- 0.1.1 - Fix bug when only one diff|patch exists in the working directory
- 0.1.2 - Update wording of instructions
