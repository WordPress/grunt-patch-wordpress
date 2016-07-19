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

## Apply a patch from the command line

1. Have a diff or a patch file in your working Directory, then run ```grunt patch```.
If multiple files are found, you'll be asked which one to apply.

2. Enter a ticket number, e.g.
  * `grunt patch:15705`

3. Enter a ticket url, e.g.
  * `grunt patch:https://core.trac.wordpress.org/ticket/15705`

4. Enter a patch url, e.g.
  * `grunt patch:patch:https://core.trac.wordpress.org/attachment/ticket/11817/13711.diff`

## Upload a patch from the command line

After you've made changes to your local WordPress develop repository, you can upload a patch file directly to a Trac ticket. e.g. given the ticket number is 2907,

```bash
grunt upload_patch:2907
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- 0.1.0 - Initial Release
- 0.1.1 - Fix bug when only one diff|patch exists in the working directory
- 0.1.2 - Update wording of instructions
- 0.2.0 - Add support for patches generated in more ways. Improve UX by outputing results all the time
- 0.3.0 - Only keep diff when debug flag is passed. Default to selecting newest patch. Make more files patchable. Allow input during patching process incase the shell prompts the user
- 0.4.0 - add upload_patch, add support for github urls
- 0.4.1 - Remove Mocha as a peerdendency
- 0.4.2 - set `cmd-diff` to `diff` for svn
