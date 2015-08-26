# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

#### [0.3.3] - 2015-08-28
##### Added
- Added a README update for Collaborators

#### [0.3.2] - 2015-08-10
##### Added/Removed/Fixed/Changed
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

### [0.3.1] - 2015-08-08
#### Added/Changed/Fixed
- Changed the naming conventions around many providers
- Added support for declaring Angular providers via decorators
- Added $on/$broadcast/$watch methods to $scope
- Removed "Angular" references
- Audited $Util classes
- Fixed/Added Tests and docstrings

## [0.3.0] - 2015-07-04
### Fixed/Added
- Fixed some issues with deep routing and RegExp
- Added support for routed Controllers as functions

#### [0.2.8] - 2015-06-30
##### Fixed
- Fixed HTML mime type in the $MimeTypeProvider

#### [0.2.7] - 2015-06-30
##### Changed
- Improved the way $MimeType works to never return an empty value.

### [0.2.6] - 2015-06-28
#### Added
- Added deep routing (Both RegExp and string matching) to $RouteProvider and BaseRequest. This is configurable with the same  $RouteProvider.prototype.when function as before called with either a RegExp object or a string and a route object with as many nested route objects as desired.

### [0.2.5] - 2015-06-27
#### Added
- Added operators to Model queries. "~" can be used for a "like" query and "<," ">," "=" can all be used alone or in conjunction to make conditional queries

### [0.2.4] - 2015-06-26
#### Added
- Template/Directive parsing support.

### [0.2.3] - 2015-06-10
#### Added
- MySQL and Sqlite3 CRUDdy operation support.
