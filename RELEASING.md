# Releasing updates

## Manual Testing

Due to the interactive nature of grunt-patch-wordpress, some manual testing is required in order to release a new version. This describes the bare minimum of testing needed to release a new version. 

1) Open a ticket on WordPress Core Trac for the new version. This ticket will serve as both the test bed and for actually updating grunt-patch-wordpress.
2) Use `npm link` to test the unreleased version of grunt-patch-wordpress
3) create a patch in WordPress to bump grunt patch wordpress and upload it using `npm run grunt upload_patch`.
4) Revert that file.
5) use `npm run grunt patch` to check the file you just uploaded

## Major, Minor, or Patch

Major: Something is different
Minor: Something is new
Patch: Something is fixed

Changing the minimum node version is a major version change 

## Update the Numbers/Docs 

1) bump package.json
2) Update Readme with new version
3) When pushing to WordPress Core, give props to everyone who contributed to grunt-patch-wordpress
