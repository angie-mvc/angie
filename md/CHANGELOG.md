# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

### [0.4.5] - 2015-10-25
#### Changed
- Exposed `$MimeType` as a service
- Changed the name of the "Util.js" file to "util.js"
- Added the option to start Angie as a clustered application by calling the `angie cluster` command
- Added support for flags on RegExp routes

#### [0.4.4] - 2015-10-19
##### Added/Changed/Fixed
- Refactored the `$ExceptionsProvider` to `$Exceptions` and properly placed it in the services directory
- Added tests for `$Exceptions`
- Added tests for the `Config` internal class
- Added `$Log` as a registered module (Fix)
- Added WallabyJS configuration
- Add the ability to set X-Frame-Options header, as well as provisional security headers, in the response
- Modified `.editorconfig` to include a global file configuration as well as js/css/html
- Exposed the NodeJS webserver as the `$server` service.

#### [0.4.3] - 2015-09-29
##### Changed
- Modified README

#### [0.4.2] - 2015-09-29
##### Added/Changed
- Modified the fashion in which args are parsed for CLI tasks (backwards compatible with older parsing)
- Moved all non-README markdown
- Moved the QUICKSTART into its own markdown file
- Added styles to default and 404 pages
- Added tests for `$$templateLoader`, the internal template/static asset loader

#### [0.4.1] - 2015-09-20
##### Added/Changed/Removed
- Modified the way headers are added to responses
- Added `app.controller` as an alias method for `app.Controller`
- Added `app.view` as an alias method for `app.directive`
- Removed jsDOM
- Added README documentation around directives and their simple usage
- Added Cheerio for compilation, which offers many advantages:
    - Ease of installation (no Contextify)
    - Speed of compilation
    - Flexibility in HTML parsing
    - More information is available on the [Cheerio GitHub repository](https://github.com/cheeriojs/cheerio "Cheerio")

### [0.4.0] - 2015-09-07
#### Added/Fixed
- Broke up `BaseRequest` into several response classes in `$Response`
- Fixed `$StringUtil` functions to use RegExp instead of string manipulation
- Made `$$tearDown` on the Angie object accept multiple modules
- Force a response with a timeout if no response is received from the Controller, configurable based on the AngieFile `responseErrorTimeout` option
- Added a README update for Collaborators
- Fixed many many tests
- Added documentation for the new $Response methods.

#### [0.3.3] - 2015-08-27
##### Added/Fixed
- Fixed the project scaffold option to cache static assets
- Added `factories` directory to scaffold

#### [0.3.2] - 2015-08-10
##### Added/Changed/Fixed/Removed
- Added default loaded JavaScript file (application.js)
- Added CLI option parser with two options
    - Should Angie cache static assets?
    - What should the name be for the default script file loaded by the Angie app?
- Removed extraneous `"use strict"` commands in modules.
- Removed warning for server stability.
- Added the ability to load a default script file on routes
- Added tests for `$resourceLoader`
- Moved the entirety of the site from the `gh-pages` branch to the README.
- Created a `dist` folder/runtime with an equivalent pre-compiled Angie framework.
- Changed the `watch` command to use Facebook Watchman. Added associated documentation.

#### [0.3.1] - 2015-08-08
##### Added/Changed/Fixed
- Changed the naming conventions around many providers
- Added support for declaring Angular providers via decorators
- Added $on/$broadcast/$watch methods to $scope
- Removed "Angular" references
- Audited $Util classes
- Fixed/Added Tests and docstrings

### [0.3.0] - 2015-07-04
#### Added/Fixed
- Fixed some issues with deep routing and RegExp
- Added support for routed Controllers as functions

#### [0.2.8] - 2015-06-30
##### Fixed
- Fixed HTML mime type in the $MimeTypeProvider

#### [0.2.7] - 2015-06-30
##### Changed
- Improved the way $MimeType works to never return an empty value.

#### [0.2.6] - 2015-06-28
##### Added
- Added deep routing (Both RegExp and string matching) to $RouteProvider and BaseRequest. This is configurable with the same  $RouteProvider.prototype.when function as before called with either a RegExp object or a string and a route object with as many nested route objects as desired.

#### [0.2.5] - 2015-06-27
##### Added
- Added operators to Model queries. "~" can be used for a "like" query and "<," ">," "=" can all be used alone or in conjunction to make conditional queries

#### [0.2.4] - 2015-06-26
##### Added
- Template/Directive parsing support.

#### [0.2.3] - 2015-06-10
##### Added
- MySQL and Sqlite3 CRUDdy operation support.
