/**
 * @module Angie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from                          'fs';
import { magenta, blue } from           'chalk';
import $LogProvider from                'angie-log';
import {$injectionBinder} from          'angie-injector';

// Angie Modules
import { config } from                  './Config';
import { $scope } from                  './controllers/$ScopeProvider';
import $RouteProvider from              './factories/$RouteProvider';
import $CacheFactory from               './factories/$CacheFactory';
import $compile from                    './factories/$Compile';
import {
    $templateCache,
    $resourceLoader
} from                                  './factories/$TemplateCache';
import { $StringUtil } from             './util/Util';
import * as $ExceptionsProvider from    './util/$ExceptionsProvider';

const CWD = process.cwd(),
    $$require = v => {

        // If we dont first clear this out of the module cache, then we don't
        // actually do anything with the require call that isn't assigned
        delete require.cache[ v ];

        // Furthermore because it is unassigned, we do not have to force anything
        // to return from this arrow function
        require(v);
    },
    parse = v => JSON.parse(fs.readFileSync(v, 'utf8'));

/**
 * @desc This is the default Angie class. It is instantiated and given
 * the namespace `global.app`. Static methods are available via this
 * instance.
 *
 * It is ill advised to tray and redefine the native app as it is tightly coupled
 * with the resource pipeline & webserver, instead, use the Angie class to
 * access commonly used static methods.
 *
 * @since 0.0.1
 * @access public
 * @extends {$Util}
 * @example Angie.noop() // = undefined
 */
class Angie {
    constructor() {
        this.constants = {};
        this.configs = [];
        this.services = {};
        this.factories = {};
        this.Controllers = {};
        this.directives = {};
        this.$dependencies = [];
        this.$$registry = {};

        this.$$config = config;
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

    /**
     * @desc Creates an Angie service provider. This must be an object.
     *
     * @since 0.0.1
     * @access public
     *
     * @param {string} name The name of the service being created
     * @param {object} obj The object value
     * @returns {object} this instanceof Angie
     *
     * @example Angie.service('foo', {});
     */
    service(name, obj) {

        // Verify that the service is an object
        if (typeof obj !== 'object') {
            throw new $ExceptionsProvider.$$InvalidServiceConfigError(name);
        }
        return this.$$register('services', name, obj);
    }

    /**
     * @desc Creates an Angie service provider. This must be a function.
     *
     * @since 0.3.1
     * @access public
     *
     * @param {string} name The name of the factory being created
     * @param {function} fn The function value
     * @returns {object} this instanceof Angie
     *
     * @example Angie.factory('foo', () => undefined);
     */
    factory(name, fn) {

        // Verify that the factory is a function
        if (typeof fn !== 'function' || !fn.prototype.constructor) {
            throw new $ExceptionsProvider.$$InvalidFactoryConfigError(name);
        }
        return this.$$register('factories', name, fn);
    }

    /**
     * @desc Creates an Angie Controller provider. This must be a function that
     * returns an object or an object.
     *
     * @since 0.0.1
     * @access public
     *
     * @param {string} name The name of the factory being created
     * @param {function|object} obj The Controller value
     * @param {string} obj.template An actual HTML template to be added as a
     * byproduct of the Controller
     * @param {string} obj.templatePath The path to an HTML template to be
     * added as a byproduct of the Controller
     * @returns {object} this instanceof Angie
     *
     * @example Angie.Controller('foo', () => {});
     */
    Controller(name, obj) {
        if (typeof obj !== 'function') {
            throw new $ExceptionsProvider.$$InvalidControllerConfigError(name);
        }
        return this.$$register('Controllers', name, obj);
    }

    /**
     * @desc Alias of the Controller function.
     * @since 0.4.1
     * @access public
     * @example Angie.Controller('foo', () => {});
     */
    controller(name, obj) {
        return this.Controller.call(this, name, obj);
    }

    /**
     * @desc Creates an Angie directive provider. The second parameter
     * of the directive function must be an object, with properties defining the
     * directive itself.
     * @since 0.2.3
     * @access public
     * @param {string} name The name of the constant being created
     * @param {function|object} obj The directive value, returns directive params
     * @param {string} obj().Controller The associated directive controller
     * @param {number} obj().priority A number representing the directive's
     * priority, relative to the other declared directives
     * @param {string} obj().restrict What HTML components can parse this directive:
     *    'A': attribute
     *    'E': element
     *    'C': class
     * @param {function} obj().link A function to fire after the directive is
     * parsed
     * @param {string} obj().template An actual HTML template to be added as a
     * byproduct of the directive
     * @param {string} obj().templatePath The path to an HTML template to be
     * added as a byproduct of the directive
     * @returns {object} this instanceof Angie
     * @example Angie.directive('foo', {
     *     return {
     *         Controller: 'test',
     *         link: function() {}
     *     };
     * });
     */
    directive(name, obj) {
        const dir = typeof obj !== 'function' ?
            obj : new $injectionBinder(obj, 'directive')();

        if (dir.hasOwnProperty('Controller')) {
            if (typeof dir.Controller !== 'string') {
                delete dir.Controller;
            }
        } else if (/api.?view/i.test(dir.type)) {
            throw new $ExceptionsProvider.$$InvalidDirectiveConfigError(name);
        }
        return this.$$register('directives', name, dir);
    }

    /**
     * @desc Alias of the directive function.
     * @since 0.4.1
     * @access public
     * @example Angie.directive('foo', {
     *     return {
     *         Controller: 'test',
     *         link: function() {}
     *     };
     * });
     */
    view(name, obj) {
        return this.directive.call(this, name, obj);
    }
    config(fn) {
        if (typeof fn === 'function') {
            this.configs.push({
                fn: fn
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

    /**
     * @desc $$tearDown will remove any component registered by method in the
     * Angie `global.app` object. It will also remove any references to the
     * component in the registry, removing the object from memory. This will
     * not unload the file from which the component was loaded from the global
     * module cache.
     * @since 0.1.0
     * @param {Array|string}  [param=[]] names A string name or Array of names
     * to be torn down in the application. A list of argument strings can also
     * be passed
     * @access private
     */
    $$tearDown(names = []) {

        // Avoid using Array.from for polyfill reasons
        names = arguments[0] instanceof Array && arguments[0].length ?
            arguments[0] : Array.prototype.slice.call(arguments);

        for (let name of names) {

            // If the component is registered, remove it from the registry
            // and from it's respective object
            if (this.$$registry[ name ]) {
                const type = this.$$registry[ name ];
                delete this.$$registry[ name ];
                delete this[ type ][ name ];
            }
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
     * @param {object}  [param=[]] dependencies The Array of dependencies
     * specified in the parent or localized AngieFile.json
     * @access private
     */
    $$loadDependencies(dependencies = []) {
        const DEPENDENCY_DIRS = [
            `${CWD}/node_modules/`,
            `${__dirname}/../node_modules/`,
            ''
        ];
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
                    let subDependencies = [],
                        $config,
                        $package,
                        name;

                    for (let i = DEPENDENCY_DIRS.length - 1; i >= 0; --i) {
                        let dir = DEPENDENCY_DIRS[ i ];
                        try {

                            // Load the angie and the package config
                            $config = parse(`${dir}${dependency}/AngieFile.json`);
                            $package = parse(`${dir}${dependency}/package.json`);

                            // If a config was found
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
                            } else {

                                // Not an Angie package, pass
                                throw new Error();
                            }

                            // No package.json, can't be an Angie package
                            if (typeof $package !== 'object') {
                                throw new Error();
                            }

                            // Try to load package "main"
                            let service = $$require(
                                `${dir}${dependency}/${$package.main}`
                            );

                            if (service) {

                                // Instantiate the dependency as a provider
                                // determined by its type
                                me[
                                    typeof service === 'function' ? 'factory' :
                                        typeof service === 'object' ? 'service' :
                                            'constant'
                                ](
                                    name || $StringUtil.toCamel(dependency),
                                    service
                                );
                            }

                            app.$dependencyConfig[ dependency ] = $config;

                            $LogProvider.info(
                                `Successfully loaded dependency ${magenta(v)}`
                            );

                            break;
                        } catch(e) {
                            if (!e.code === 'ENOENT') {
                                $LogProvider.error(e);
                            }
                        }
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
    $$bootstrap(dir = CWD) {
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
                                $$require(v);
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
            me.configs.map((v) => v.fn).forEach(function(v) {
                new $injectionBinder(v, 'config')();
            });

            // Once the configs object has been copied destroy it to prevent
            // those functions from ever being fired again in this or future
            // reloads within the same application context
            me.configs = [];
        });
    }
    $$load() {
        let me = this;

        // Load any app dependencies
        return this.$$loadDependencies(config.dependencies).then(function() {

            // Bootstrap the application
            me.$$bootstrap();
        });
    }
}

let app = global.app;
if (!app) {
    app = global.app = new Angie();

    // Require in any further external components
    // Constants
    app.constant('ANGIE_TEMPLATE_DIRS', [
        `${__dirname}/../templates`
    ].concat(
        config.templateDirs.map(mapAssetDirectoryDeclarations)
    )).constant('ANGIE_STATIC_DIRS', [
        `${__dirname}/../static`
    ].concat(
        config.staticDirs.map(mapAssetDirectoryDeclarations)
    )).constant('RESPONSE_HEADER_MESSAGES', {
        200: 'Ok',
        404: 'File Not Found',
        500: 'Internal Server Error',
        504: 'Gateway Timeout'
    }).constant(
        'PRAGMA_HEADER',
        'no-cache'
    ).constant(
        'NO_CACHE_HEADER',
        'private, no-cache, no-store, must-revalidate'
    );

    // Configs
    app.config(function() {
        $templateCache.put(
            'index.html',
            fs.readFileSync(`${__dirname}/../templates/html/index.html`, 'utf8')
        );
        $templateCache.put(
            '404.html',
            fs.readFileSync(`${__dirname}/../templates/html/404.html`, 'utf8')
        );
    });

    // Factories
    app.factory('$Routes', $RouteProvider)
        .factory('$Cache', $CacheFactory)
        .factory('$compile', $compile)
        .factory('$resourceLoader', $resourceLoader);

    // Services
    app.service('$Exceptions', $ExceptionsProvider)
        .service('$scope', $scope)
        .service('$templateCache', $templateCache);
}

function mapAssetDirectoryDeclarations(v) {
    if (v.indexOf(CWD) === -1) {
        v = `${CWD}/${$StringUtil.removeLeadingSlashes(v)}`;
    }
    v = $StringUtil.removeTrailingSlashes(v);
    return v;
}

export default app;
export { Angie };