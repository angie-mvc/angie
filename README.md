## Angie
A Component-Based NodeJS MVC in ES6

![build status](https://travis-ci.org/benderTheCrime/angie.svg?branch=master "build status")
![iojs support](https://img.shields.io/badge/iojs-1.7.1+-brightgreen.svg "iojs support")
![node support](https://img.shields.io/badge/node-0.12.0+-brightgreen.svg "node support")
![code coverage](https://rawgit.com/benderTheCrime/angie/master/svg/coverage.svg "code coverage")
![npm downloads](https://img.shields.io/npm/dm/angie.svg "npm downloads")

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

For more details on how to get started, please see the [Quickstart](#quickstart) section. For a list of Frequently Asked Questions, please see the [FAQ](https://github.com/benderTheCrime/angie/blob/master/FAQ.md "FAQ") and the [CHANGELOG](https://github.com/benderTheCrime/angie/blob/master/CHANGELOG.md "CHANGELOG") for an up to date list of changes. AngularJS is in no way used or affiliated with this project.


### Contributors
It's easy to contribute to the Angie framework:
    - Feature requests should be made through the [issues](https://github.com/benderTheCrime/angie-log/issues "issues") section of this repository.
    - Issues should be logged through the [issues](https://github.com/benderTheCrime/angie-log/issues "issues") tab as well.
    - Ancillary functionality can be added to Angie in a package. You may use the [Angie Package Template](https://github.com/benderTheCrime/angie-package-template "Angie Package Template") as a bootstrapped dependency package template.

Contributors to this Project are outlined in the [CONTRIBUTORS](https://github.com/benderTheCrime/angie/blob/master/CONTRIBUTORS.md "CONTRIBUTORS") file.

### Features
#### Write components &amp; modules like you would in AngularJS
Angie lets you create modules the way you would on the front end to serve as Controllers, directives, services, and Models on the back end. Both 1.x and 2.x AngularJS flavor syntax is supported.

#### Easy to use CLI
Scaffold a new project, run a web server, sync your database, migrate your models, open an Angie shell, and more all from the command line.

#### Dependencies
Angie allows you to define dependencies to inject services straight into your application from any other Angie application. In the AngieFile.json created when you scaffold an app is a "dependencies" section. Add the absolute path of another Angie project to this list and when the app is bootstrapped, it will give you access to any of the code you have created in the dependency application.

<!-- #### RESTful API responses &amp; template rendering -->

#### Flexible ORM
Angie makes creating &amp; maintaining data models across many different databases easy. Add your configuration options to a configuration file, sync your database and perform CRUDdy operations with ease. Support for more databases is being added all the time. For more information on the ORM, please visit the [Angie ORM Repository](https://github.com/benderTheCrime/angie-orm "angie-orm")

<!-- #### "6-way" databinding -->
<!-- #### Desktop Application Manager -->

### Documentation
The entire application documentation can be found [here](https://doc.esdoc.org/github.com/benderTheCrime/angie/ "documentation").

### Quickstart
Angie is designed predominately to be used with versions of iojs-2.0.0+. I recommend using nvm. to manage your NodeJS versions. It cannot be downloaded via NPM: [nvm](https://github.com/creationix/nvm "nvm"). Please visit this link and follow the instructions listed for iojs-2.2.1. it will also work with 0.12.x versions of NodeJS, but I am advising using these versions with caution, predominately as a byproduct of NPM package version installation dependencies. Switching in between versions after an Angie installation will cause module dependency mismatches.

It is also worth mentioning beforehand that Angie supports writing all of the syntax in this document in an ES6 fashion as well. Models can be instantiated as classes, and imports can be performed instead of references to the `global.app` object.

This tutorial should take about 15 minutes in its entirety.

* [Now We Can Write Some Code!](#now-we-can-write-some-code)
* [Getting Started with Models!](#getting-started-with-models)

#### First, We're Going to Need Some Packages!
In the directory you would like your project to live, please run the following command:
```bash
npm install -g babel gulp-cli angie
angie createProject [name] [location]
```
Where NPM installs the Babel, Gulp, and Angie packages globally and where this Angie command creates a project in your current directory or passed (location) directory by the name entered. Not specifying a project name or specifying a location that is invalid will throw an error. To see a full list of Angie commands, use the following:
```bash
angie help
```
Hopefully by now, you've got a scaffolded project. If so, it's possible to start building our app.

We can test that the application runs successfully by running the following command at the root of our application.
```bash
angie watch 3000
```
Once your server is running, you should visit the webserver started at [localhost](http://localhost:3000 "default") (provided you used port 3000 as opposed to another port). If you see the text "Angie Test Page," all is well.

#### Now We Can Write Some Code!
I like to encourage developer behavior whenever possible. Therefore, for the time being, it is not possible to load modules outside of the folders which have been scaffolded. That is to say that modules outside of these folders will not be loaded. However, any type of module can live in any of the prescribed folders.

Let's start by setting up some routes! In the configs directory, "src/configs", create a file called `routes.config.js`. Add the following code to that file:

```javascript
app.config(function($routeProvider) {
    $routeProvider.when('/test', {
        templatePath: 'index.html'
    });
});
```
This block should look somewhat familiar to you if you have written an AngularJS application. If you have not, I recommend looking into AngularJS. What we have just done is set up a custom route in our Angie application. To make sure that Angie knows where to find this route let's also add a file to our "template" directory. This directory was automatically added to your application when it was scaffolded.
```bash
cd templates
echo test >> test.html
```
This should have created a file called test.html in your templates folder. Because the templates directory is already included in our `AngieFile.json`, we do not need to tell the application where to find this template file. However, if we were to add the file in `templates/html`, we would need to specify this directory under `templateDirs` in the scaffolded `AngieFile.json`.

If you visit [that route](http://localhost:3000/test "route") in your browser, you should now see the file you created. Simple web server: check. Now, let's get a little fancy... just a little. Open the test.html file you just created and triple bracket "test":
```html
{{{test}}}
```
In Angie templates triple brackets are compiled. Default directives are prefaced with "ngie". We can now configure a scope with which to compile this template. We will first need a controller. From the application root, navigate to the `src/controllers` folder. Once there, create a file called `test.ctrl.js` to which we will add the following:
```javascript
app.Controller('testCtrl', function($scope, $request) {
    $scope.test = $request.query.test || 'test';
});
```
Now that we have a Controller, we can update our route to reference it.
```javascript
app.config(function($routeProvider) {
    $routeProvider.when('/test', {
        templatePath: 'index.html'
        Controller: 'testCtrl'
    });
});
```
With that in place, if you visit the same route as before you should see the text "test," but if you visit [the route with an added query param, `test=angie`](http://localhost:3000/test?test=angie "modified route") you should see the text "angie". We have modified our scope to reflect the scope property "test," which is subsequently compiled into the template before a response is returned.

Angie will parse any expression included in triple brackets. If your expression is not interpreted, most likely because you referenced a property that did not actually exist on your scope, the triple bracketed expression will be replaced by an empty string.

It is worth noting that deep routes and RegExp routes can also be written! Each deep property that is not a `$routeProvider` keyword will be added as a route:
```javascript
app.config(function($routeProvider) {
    $routeProvider.when('/test', {
        templatePath: 'index.html'
        Controller: 'testCtrl',
        '/([A-Za-z0-9])/': {
            templatePath: 'nextIndex.html'
        }
    });
});
```
In this context, the route matching the RegExp `/test\/([A-Za-z0-9])\/` will be followed and the match pattern (the RegExp clause of the route) will be passed to the `request.query` of the request as params with keys 0-4 (up to five patterns will be matched). More details on this are available in the [documentation](https://doc.esdoc.org/github.com/benderTheCrime/angie/ "documentation").

#### Getting Started with Models!
Next we will set up a very simple Model. Angie Models are very different from AngularJS models in the sense that they are actually database objects as opposed to front end data models. The databases which communicate with the Angie ORM are all configured in the `AngieFile.json`.

All of the following code is required into the Angie project from the [Angie ORM Repository](https://github.com/benderTheCrime/angie-orm "angie-orm") and outlined in additional detail on that repository's site.

To create a new database connection, we add an object to our `AngieFile.json` under the "databases" property under a key that represents the database name. One should already exist as a result of the scaffold.
```json
"testCtrl": {
  "type": "sqlite3",
  "name": "projectName.db"
}
```
However, no database is created until it is synced. For more information about what options are required by a specific database type or whether a database is supported, please see the [documentation](https://doc.esdoc.org/github.com/benderTheCrime/angie/ "documentation").

Now let's create our database by running the "sync" command:
```bash
angie syncdb [database name]
```
Note that the command above takes an optional database option. This is not required if we are syncing our default database. Also, note that we haven't actually created any models. Let's create one now. In the scaffolded folder `src/Models` create a file called `test.model.js`. In this file, we will create our model.
```javascript
app.Model('TestAngie', function($fields) {
   let obj = {};
   obj.name = 'test_angie';
   obj.name = new $fields.CharField({
       minLength: 1,
       maxLength: 50,
       unique: true
   });
});
```
If you run the "syncdb" command once more, it will add a model to our database with the name "test_angie", which is a horrible naming convention, but we are using it for demonstratory purposes. Feel free to change this at your leisure. Without the "name" property, this model would be named "TestAngie". The `$fields` service is automatically passed into the model. It gives the model access to all the available field types We've added a CharField to our model. The `$fields` service supports all of the fields you may want to use in your project. See the [documentation](https://doc.esdoc.org/github.com/benderTheCrime/angie/ "documentation") for a full list.

Now for the fun part, we are going to create a record in our database and then get that record to render in our previously created template. Open up a sqlite shell using the following command:
```bash
sqlite3 < [database name] # Do not forget the .db!
```
After the database shell opens, run the following command and then quit the shell.
```sql
INSERT INTO test_angie (username) VALUES ('blah');
```
We are finally ready to revisit our Controller. In the `test.ctrl.js` we created before replace the `$scope` assignment of "test" with the following code:
```javascript
AngieUserModel.filter({
    rows: 1,
    head: true,
    username: 'blah',
    database: 'default'
}).then(function(queryset) {
    $scope.test = queryset[0].username;
    app.Controller.done();
});
```
Now, if you revisit our former [test page](http://localhost:3000/test) you should see the text "blah." Note that our Controller can be asynchronous or synchronous, but if it operates in an async fashion, it must resolve. It can resolve based on the very last argument passed to the Controller, or the
done method on `app.Controller` or `$response.Controller`.

This concludes the Angie Quickstart! I hope you enjoyed building your very own backend app with Angie. Feel free to let me know what you think about the library or any [issues](https://github.com/benderTheCrime/angie/issues) in this repository.