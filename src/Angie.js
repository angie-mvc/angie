'use strict'; 'use strong';

// System Modules
import fs from                                          'fs';
import {magenta, blue} from                             'chalk';
import $LogProvider from                                'angie-log';
import {$injectionBinder} from                          'angie-injector';

// Angie Modules
import {config} from                                    './Config';
import {$scope} from                                    '../controllers/$ScopeProvider';
import $RouteProvider from                              './services/$RouteProvider';
import $CacheFactory from                               './services/$CacheFactory';
import $compile from                                    './services/$Compile';
import {$templateCache, $resourceLoader} from           './services/$TemplateCache';
import $Util, {
    $StringUtil
} from                                                  './util/Util';
import * as $ExceptionsProvider from                    './util/$ExceptionsProvider';

/**
 * @desc This is the default Angie class. It is instantiated and given
 * the namespace `global.app`. Static methods are available via this
 * instance.
 *
 * It is ill advised to tray and redefine the native app as it is tightly coupled
 * with the resource pipeline & webserver, instead, use the Angie class to
 * access commonly used static methods.
 *
 * @todo rename this class
 * @since 0.0.1
 * @access public
 * @extends $Util
 * @example Angie.noop() // = undefined
 */
class Angie extends $Util {
    constructor() {
        super();
        this.constants = {};
        this.configs = [];
        this.services = {};
        this.factories = {};
        this.Controllers = {};
        this.directives = {};
        this.$dependencies = [];
        this.$$registry = {};
        this.$$loaded = false;
    }

    /**
     * @desc Creates an Angie constant provider
     *
     * @since 0.0.1
     * @access public
     *
     * @param {string} name The name of the constant being created
     * @param {object|string|number|Array<>|boolean} obj The object value
     * @returns {object} this instanceof Angie
     *
     * @example Angie.constant('foo', 'bar');
     */
    constant(name, obj) {
        return this.$$register('constants', name, obj);
    }
    service(name, obj) {

        // Verify that the service is an object
        if (typeof obj !== 'object') {
            throw new $ExceptionsProvider.$$InvalidServiceConfigError(name);
        }
        return this.$$register('services', name, obj);
    }
    factory(name, obj) {
        // Verify that the service is an object
        if (typeof obj !== 'function' || !obj.prototype) {
            throw new $ExceptionsProvider.$$InvalidFactoryConfigError(name);
        }
        return this.$$register('factories', name, obj);
    }
    Controller(name, obj) {
        return this.$$register('Controllers', name, obj);
    }

    /**
     * @desc Creates an Angie directive provider. The second parameter
     * of the directive function must be an object, with properties defining the
     * directive itself.
     *
     * @since 0.2.3
     * @access public
     *
     * @param {string} name The name of the constant being created
     * @param {function|object} obj The directive value, returns directive params
     * @param {string} obj().Controller The associated directive controller
     * @param {number} obj().priority A number representing the directive's
     * priority, relative to the other declared directives
     * @param {boolean} obj().replace Does the directive root get replaced by
     * its inner HTML?
     * @param {string} obj().restrict What HTML components can parse this directive:
     *    'A': attribute
     *    'E': element
     *    'C': class
     * @param {function} obj().link A function to fire after the directive is
     * parsed
     * @returns {object} this instanceof Angie
     *
     * @example Angie.directive('foo', {
     *     return {
     *         Controller: 'test',
     *         link: function() {}
     *     };
     * });
     */
    directive(name, obj) {
        const dir = typeof obj !== 'function' ? obj : new $injectionBinder(obj)();

        if (dir.hasOwnProperty('Controller')) {
            if (typeof dir.Controller !== 'string') {
                delete dir.Controller;
            }
        } else if (/api.?view/i.test(dir.type)) {
            throw new $ExceptionsProvider.$$InvalidDirectiveConfigError(name);
        }
        return this.$$register('directives', name, dir);
    }
    config(fn) {
        if (typeof fn === 'function') {
            this.configs.push({
                fn: fn,
                fired: false
            });
        } else {
            $LogProvider.warn('Invalid config type specified');
        }
        return this;
    }
    $$register(component, name, obj) {

        // `component` and `app.component` should always be defined
        if (name && obj) {
            this.$$registry[ name ] = component;
            this[ component ][ name ] = obj;
        } else {
            $LogProvider.warn(
                `Invalid name or object ${name} called on app.${component}`
            );
        }
        return this;
    }

    // Tear down a registered component
    $$tearDown(name) {
        if (name && this.$$registry[ name ]) {
            const type = this.$$registry[ name ];
            delete this.$$registry[ name ];
            delete this[ type ][ name ];
        }
        return this;
    }

    /**
     * @desc Load all project dependencies from an Array of dependencies
     * specified in the AngieFile.json. This will load packages in the order
     * they are specified, exposing any application Modules to the application
     * and prepping any application configuration in the nested modules. It will
     * not load duplicate modules. Dependencies are typically declared as a
     * node_module path, but can also be declared as a singular (main) file.
     * @since 0.1.0
     * @access private
     * @param {object}  [param=[]] dependencies The Array of dependencies
     * specified in the parent or localized AngieFile.json
     */
    $$loadDependencies(dependencies = []) {
        let me = this,
            proms = [];

        // Make sure we do not load duplicate dependencies
        dependencies = dependencies.filter(
            (v) => me.$dependencies.indexOf(v) === -1
        );

        // Add dependencies
        this.$dependencies = this.$dependencies.concat(dependencies);
        dependencies.forEach(function(v) {
            let dependency = $StringUtil.removeTrailingLeadingSlashes(v),

                // This will load all of the modules, overwriting a module name
                // will replace it
                prom = new Promise(function(resolve) {
                    let $config,
                        name,
                        subDependencies;

                    try {
                        $config = JSON.parse(
                            fs.readFileSync(
                                `./node_modules/${dependency}/AngieFile.json`,
                                'utf8'
                            )
                        );
                    } catch(e) {
                        $LogProvider.error(e);
                    }

                    if (typeof $config === 'object') {

                        // Grab the dependency name fo' reals
                        name = $config.projectName;

                        // Find any sub dependencies for recursive module
                        // loading
                        subDependencies = config.dependencies;

                        // Set the config in dependency configs (just in case)
                        if (!app.$dependencyConfig) {
                            app.$dependencyConfig = {};
                        }
                        app.$dependencyConfig[ dependency ] = $config;
                    }

                    try {

                        let service = require(dependency);

                        // TODO make this try to load not an npm project config
                        if (service) {
                            me.service(
                                name || $StringUtil.toCamel(dependency),
                                require(dependency)
                            );
                            $LogProvider.info(
                                `Successfully loaded dependency ${magenta(v)}`
                            );
                        }
                    } catch(e) {
                        $LogProvider.error(e);
                    }

                    return app.$$loadDependencies(
                        subDependencies || []
                    ).then(resolve);
                });
            proms.push(prom);
        });
        return Promise.all(proms);
    }

    /**
     * @desc Load all of the files associated with the parent and child Angie
     * applications. This will transpile and deliver all modules associated with
     * both the parent and child applications.
     * @since 0.1.0
     * @access private
     * @param {string}  [param=process.cwd()] dir The dir to scan for modules
     */
    $$bootstrap(dir = process.cwd()) {
        let me = this,
            src = typeof config.projectRoot === 'string' ?
                $StringUtil.removeTrailingLeadingSlashes(config.projectRoot) :
                'src';

        return new Promise(function(resolve) {
            resolve(
                fs.readdirSync(`${dir}/${src}`).map((v) => `${dir}/src/${v}`)
            );
        }).then(function(files) {
            let proms = [],
                fn = function loadFiles(files) {

                    // We don't want to load any of these files
                    files.forEach(function(v) {
                        if (
                            /node_modules|bower_components|templates|static/i
                            .test(v)
                        ) {

                            // If any part of our url contains these return
                            return;
                        } else if (
                            [ 'js', 'es6' ].indexOf(v.split('.').pop() || '') > -1
                        ) {
                            try {
                                require(v);
                                $LogProvider.info(
                                    `Successfully loaded file ${blue(v)}`
                                );
                            } catch(e) {
                                $LogProvider.error(e);
                            }
                        } else {
                            try {
                                fn(fs.readdirSync(v).map(($v) => `${v}/${$v}`));
                            } catch(e) {
                                $LogProvider.warn(
                                    `Treating ${blue(v)} as a directory, but it is a file`
                                );
                            }
                        }
                    });
                };
            fn(files);
            return Promise.all(proms);
        }).then(function() {

            // Once all of the modules are loaded, run the configs
            me.configs.forEach(function(v) {

                // Check to see if the config has already fired, if it has, we
                // do not want to fire it again
                if (!v.fired) {
                    new $injectionBinder(v.fn)();

                    // Mark as fired
                    v.fired = true;
                }
            });
        });
    }
    $$load() {
        let me = this;

        // Do not call load twice
        if (this.$$loaded === true) {
            return new Promise((r) => { r(); });
        }

        // Load any app dependencies
        return this.$$loadDependencies(config.dependencies).then(function() {

            // Set the app in a loaded state
            me.$$loaded = true;

            // Bootstrap the application
            me.$$bootstrap();
        });
    }
}

let app = global.app = new Angie();
app.config(function() {
    $templateCache.put(
        'index.html',
        fs.readFileSync(`${__dirname}/templates/html/index.html`, 'utf8')
    );
    $templateCache.put(
        '404.html',
        fs.readFileSync(`${__dirname}/templates/html/404.html`, 'utf8')
    );
})
.service('$Routes', $RouteProvider)
.service('$compile', $compile)

// Error utilities
.service('$Exceptions', $ExceptionsProvider)

// TODO we shouldn't have to expose this?
.service('$scope', $scope)
.service('$window', {})
.service('$document', {})
.service('$templateCache', $templateCache)
.service('$Cache', $CacheFactory)
.service('$resourceLoader', $resourceLoader);


// TODO open this back up when you have an admin model
// .Model('AngieUserModel', function($fields) {
//     let obj = {};
//
//     obj.name = 'angie_user';
//     obj.username = new $fields.CharField({
//         minLength: 1,
//         maxLength: 50,
//         unique: true
//     });
//     // obj.migration = new $fields.ForeignKeyField('angie_migrations', {
//     //     nullable: true,
//     //     nested: true
//     // });
//     obj.save = function() {
//         // TODO this would override the base, but using an es6 class will not
//     };
//     return obj;
// });
// .Model('AngieMigrationsModel', class MigrationsModel {
//     constructor() {
//         this.name = 'angie_migrations';
//     }
// });

export default app;
export {Angie};

