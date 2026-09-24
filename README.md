# grunt-patch-wordpress
![Unit Tests](https://github.com/WordPress/grunt-patch-wordpress/workflows/Unit%20Tests/badge.svg)

> Patch your develop-wordpress directory like a boss (also works on other trac based projects)

## Getting Started
This plugin requires Grunt `~0.4.5`

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

## Reading from Trac

WordPress.org's Trac instances answer non-browser clients with a JavaScript bot-protection challenge (HTTP 403), so the `patch` and `ticket` tasks fetch from Trac through a headless Chromium driven by [Playwright](https://playwright.dev/). Playwright is an optional peer dependency; install it once in your project:

```shell
  npm install --save-dev playwright
  npx playwright install chromium
```

`wordpress-develop` already ships Playwright, so there only the `npx playwright install chromium` step is needed. Both tasks explain what to run if either piece is missing. The browser profile, and with it the challenge cookie, is kept in `~/.cache/grunt-patch-wordpress`. Uploading a patch does not use the browser.

## Apply a patch from the command line

1. Have a diff or a patch file in your working Directory, then run ```grunt patch```.
If multiple files are found, you'll be asked which one to apply.

2. Enter a ticket number, e.g.
  * `grunt patch:15705`

3. Enter a ticket url, e.g.
  * `grunt patch:https://core.trac.wordpress.org/ticket/15705`

4. Enter a patch url, e.g.
  * `grunt patch:https://core.trac.wordpress.org/attachment/ticket/11817/13711.diff`

5. Enter a github url that points to a changeset such as a Pull Request, e.g.
  * `grunt patch:https://github.com/aaronjorbin/develop.wordpress/pull/23`

## Read a ticket from the command line

Print a ticket's summary, properties, description, attachments (with raw download URLs), linked pull requests, and full change history:

```bash
grunt ticket:15705
grunt ticket:https://core.trac.wordpress.org/ticket/15705
grunt ticket:15705 --json
```

Ticket URLs may point at any Trac host, e.g. `grunt ticket:https://meta.trac.wordpress.org/ticket/8202`. Bare numbers use the configured `tracUrl`.

## Upload a patch from the command line

After you've made changes to your local WordPress develop repository, you can upload a patch file directly to a Trac ticket. e.g. given the ticket number is 2907,

```bash
grunt upload_patch:2907
```

You can also store your WordPress.org credentials in environment variables. Please exercise caution when using this option, as it may cause your credentials to be leaked!

```bash
export WPORG_USERNAME=matt
export WPORG_PASSWORD=MyPasswordIsVerySecure12345
grunt uploadPatch:40000
```

## Using the file_mappings option
If you'd like to map old file paths in your patch to new file paths during the patching process, you can pass a file mappings object as an option. Using this option can be helpful when the file paths in the project have been changed since you've created your patch.

The file mappings object should contain old file paths and the corresponding new file paths. In the Gruntfile.js of your project, this would look like this:

```
patch: {
	options: {
		file_mappings: {
			'old_path1': 'new_path1',
			'old_path2': 'new_path2',
			'old_path3': 'new_path3',
		}
	}
}
```
 In this example, the patch task will look for 'old_path1', 'old_path2' and 'old_path3' in your patch and replace them during patching with 'new_path1', 'new_path2', and 'new_path3' respectively.

## Contributing

Please follow the [WordPress coding standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/javascript/).

* Add unit tests and documentation for any new or changed functionality.
* Lint and test your code using `npm run lint` and `npm run test`.

## Release History

- 0.1.0 - Initial Release
- 0.1.1 - Fix bug when only one diff|patch exists in the working directory
- 0.1.2 - Update wording of instructions
- 0.2.0 - Add support for patches generated in more ways. Improve UX by outputing results all the time
- 0.3.0 - Only keep diff when debug flag is passed. Default to selecting newest patch. Make more files patchable. Allow input during patching process incase the shell prompts the user
- 0.4.0 - add upload_patch, add support for github urls
- 0.4.1 - Remove Mocha as a peerdendency
- 0.4.2 - set `cmd-diff` to `diff` for svn
- 1.0.0 - Add filemapping option. Bump minimum node version. Change code style. Update tooling.
- 2.0.0 - Bump minimum node version. Use @wordpress/scripts. Allow Credentials to be stored. Reduce Dependancy on Grunt. 
- 3.0.0 - Bump minimum node version to [Node 12](https://github.com/WordPress/grunt-patch-wordpress/pull/89). [Update wp-scripts](https://github.com/WordPress/grunt-patch-wordpress/pull/87) and some general formatting. Use a [custom user agent for requests](https://github.com/WordPress/grunt-patch-wordpress/pull/85).
- 3.0.1 - Add support for more github URL formats. Internal: Use Github Actions instead of Travis.
- 4.0.0 - Bump minimum node version and some dependencies.
- 4.1.0 - Fetch from Trac through a headless browser so `patch` works behind Trac's bot-protection challenge. Add the `ticket` task. Drop the `request` dependency; Playwright becomes an optional peer dependency.
