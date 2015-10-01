![emblem](https://rawgit.com/angie-framework/angie/master/static/images/angie.svg "emblem")

A Module-Based NodeJS Web Application Framework in ES6

[![npm version](https://badge.fury.io/js/angie.svg)](http://badge.fury.io/js/angie "npm version")
![iojs support](https://img.shields.io/badge/iojs-1.7.1+-brightgreen.svg "iojs support")
![node support](https://img.shields.io/badge/node-0.12.0+-brightgreen.svg "node support")
![npm downloads](https://img.shields.io/npm/dm/angie.svg "npm downloads")
![build status](https://travis-ci.org/benderTheCrime/angie.svg?branch=master "build status")
[![Coverage Status](https://coveralls.io/repos/benderTheCrime/angie/badge.svg?branch=master&service=github)](https://coveralls.io/github/benderTheCrime/angie?branch=master "coverage")
[![documentation](https://doc.esdoc.org/github.com/angie-framework/angie/badge.svg)](https://doc.esdoc.org/github.com/angie-framework/angie/ "documentation")

[![NPM](https://nodei.co/npm/angie.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/angie/)

### Usage
```bash
npm i -g angie
angie help
```
If you want your files to automatically refresh with the `angie watch` command, run this from the root of the
Angie package:
```
chmod +x script/watchman.sh && ./script/watchman.sh
```
or install Facebook Watchman from the instructions [here](https://facebook.github.io/watchman/docs/install.html "Facebook Watchman").

### About
Angie is an MVC that runs in NodeJS designed with AngularJS in mind. It allows you to create web applications by routing requests to controllers and directives and referencing data models in a fashion similar to how you would using AngularJS. Although the naming and providers are different, the goals and best practices are the same.

Angie is simple to use, flexible, and lightweight and offers a holistic approach to JavaScript across the stack.

For more details on how to get started, please see the [Quickstart](#quickstart) section. For a list of Frequently Asked Questions, please see the [FAQ](https://github.com/angie-framework/angie/blob/master/md/FAQ.md "FAQ") and the [CHANGELOG](https://github.com/angie-framework/angie/blob/master/md/CHANGELOG.md "CHANGELOG") for an up to date list of changes. AngularJS is in no way used or affiliated with this project.

### Contributors
It's easy to contribute to the Angie Framework:
    - Feature requests should be made through the [issues](https://github.com/angie-framework/angie-injector/issues "issues") section of this repository.
    - Issues should be logged through the [issues](https://github.com/angie-framework/angie-injector/issues "issues") tab as well.
    - Ancillary functionality can be added to Angie in a package. You may use the [Angie Package Template](https://github.com/angie-framework/angie-package-template "Angie Package Template") as a bootstrapped dependency package template.

Contributors to this Project are outlined in the [CONTRIBUTORS](https://github.com/angie-framework/angie/blob/master/md/CONTRIBUTORS.md "CONTRIBUTORS") file.

### Features
#### Write components &amp; modules like you would in AngularJS
Angie lets you create modules the way you would on the front end to serve as Controllers, directives, services, and Models on the back end. Both 1.x and 2.x AngularJS flavor syntax is supported.

#### Easy to use CLI
Scaffold a new project, run a web server, sync your database, migrate your models, open an Angie shell, and more all from the command line.

#### Dependencies
Angie allows you to define dependencies to inject services straight into your application from any other Angie application. In the AngieFile.json created when you scaffold an app is a "dependencies" section. Add the absolute path of another Angie project to this list and when the app is bootstrapped, it will give you access to any of the code you have created in the dependency application.

#### RESTful API responses &amp; template rendering
Angie RESTful responses are accomplished via the [Angie REST Framework](https://github.com/angie-framework/angie-rest-framework "angie-rest-framework"). With the inclusion of this dependency, your Controllers have the ability to route requests via "allowed" method endpoints and serialize request and render response data from the Controller methods into a variety of formats.

Templates can be pre-rendered by Controllers with Angie! The template compiler understands partial templates, scope inclusion, and can execute default or custom directives.

#### Flexible ORM
Angie makes creating &amp; maintaining data models across many different databases easy. Add your configuration options to a configuration file, sync your database and perform CRUDdy operations with ease. Support for more databases is being added all the time. For more information on the ORM, please visit the [Angie ORM Repository](https://github.com/angie-framework/angie-orm "angie-orm")

<!-- #### "6-way" databinding -->
<!-- #### Desktop Application Manager -->

### Documentation
Angie documentation can be found [here](https://doc.esdoc.org/github.com/angie-framework/angie/ "documentation").

### Quickstart
Please see the [QUICKSTART](https://github.com/angie-framework/angie/blob/master/md/QUICKSTART.md "QUICKSTART") guide for more details.