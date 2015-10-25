/**
 * @module routes.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import $LogProvider from            'angie-log';

// Angie Modules
import $Util, { $StringUtil } from  '../util/util';

const IGNORE_KEYS = [
    'Controller',
    'template',
    'templatePath',
    'serializers',
    'renderer',
    'flags'
];
let routes = {
        '/': {
            templatePath: 'index.html'
        },
        '/404': {
            templatePath: '404.html'
        },
        '/500': {
            templatePath: '404.html'
        }
    },
    otherwise;

/**
 * @desc $Routes is provided to any service, Controller, directive, Model,
 * or view which has included it as an argument as "$Routes".
 * @todo use Symbols for RegExp store
 * @since 0.0.1
 */
class $Routes {

    /**
     * @desc Sets up a route as a possible endpoint in an Angie application.
     * @since 0.0.1
     * @param {string|Object} str String or RegExp to denote the endpoint
     * path. Supports RegExp flags
     * @param {Object} obj
     * @param {?string} obj.templatePath Optional template path
     * @param {?string} obj.template Optional template html
     * @param {?string} obj.Controller The name of the associated Controller
     * @param {?object} obj.* A deep route with another route object
     * to associate with a route consisting of the original path added to the
     * new key
     * @returns {function} Template function, compiles in whatever scope is
     * passed
     * @access public
     * @example $Routes.when('/test', {
     *     template: '<div>{{{test}}}</div>',
     *     Controller: 'TestCtrl',
     *     test2: {
     *         template: '<div>{{{test2}}}</div>',
     *         Controller: 'Test2Ctrl'
     *     }
     * });
     */
    static when(path, obj) {
        let regExpFlag = false;

        // Determine if the route is RegExp or not and register the route
        if (path.constructor.name === 'RegExp') {
            regExpFlag = true;

            if (!routes.hasOwnProperty('regExp')) {
                routes.regExp = {};
            }

            // We have to deliberately strip off the flags

            // Set a RegExp route
            routes.regExp[ path ] = $Util._extend(obj, { flags: path.flags });
        } else {

            // Set a string route
            routes[ path ] = obj;
        }

        // Find any "deep" routes which we may want to add on to the root route
        for (let key in obj) {
            let childPath,
                childObj = obj[ key ];

            // We're talking about a template or a Controller and we don't want
            // that
            // Serializers and Renderer added for REST Framework

            // It's worth noting that return based "if"s in Coffee are pretty
            // dope
            if (IGNORE_KEYS.indexOf(key) > -1) {
                continue;
            }

            // Child keys that do not have object values are ignored, but we
            // still want to delete the object property
            if (typeof childObj === 'object') {
                if (regExpFlag || /\/.*\//.test(key)) {

                    // Check to see if we previously had or now have a path with
                    // RegExp
                    childPath = this.$$stringsToRegExp(
                        path,
                        $StringUtil.removeTrailingLeadingSlashes(key)
                    );
                } else {

                    // Concatenate two string paths
                    childPath = [ path, key ].join('/').replace(/\/\//g, '/');
                }

                // If the child route does not have a Controller, force it to
                // it's parent inherit
                if (obj.Controller && !childObj.Controller) {
                    childObj.Controller = obj.Controller;
                }

                // Set a route child object
                this.when(childPath, childObj);
            }

            // Strip the child from the original route object
            delete obj[ key ];
        }
        return this;
    }

    /**
     * @desc Sets a defaulted path in the event that none of the other routes
     * or route patterns are matching. If this is a relative path, it will match
     * absolutely. If this is a full path, it will result in a 301 redirect.
     *
     * @since 0.0.1
     * @param {string} path URL string to set as the "otherwise" path
     * @returns {string} The same URL string
     * @access public
     * @example $Route.otherwise('/test');
     */
    static otherwise(path) {
        if (typeof path === 'string') {
            otherwise = path;
        } else {

            // Redirection can only occur based on this path if path is a string
            $LogProvider.warn(
                'Cannot set "otherwise" route to anything other than a string'
            );
        }
        return path;
    }

    /**
     * @desc Returns all of the set application routes
     * @since 0.0.1
     * @returns {object} Routes object (inc. RegExps) and otherwise path objects
     * @access public
     */
    static fetch() {
        let obj = { routes };
        if (otherwise) {
            obj.otherwise = otherwise;
        }
        return obj;
    }

    /**
     * @desc $Routes.$$clear is a helper method designated to clear out all
     * of the routes in the test environment. Don't call it or you might have a
     * bad time.
     * @since 0.2.5
     * @access private
     * @example $Routes.$$clear() // routes = {};
     */
    static $$clear() {
        routes = {};
        otherwise = undefined;
    }

    /**
     * @desc Take RegExp literals or strings and return a new RexExp
     * @since 0.2.5
     * @param {string|object} str Arguments of strings or RegExp literals
     * @returns {object} Concatenated RegExps joined by "/"
     * @access private
     * @example var regExp = $Routes.$$stringsToRegExp(/test/, test);
     *     regExp.test('test/test') === true;
     */
    static $$stringsToRegExp() {
        const args = Array.prototype.slice.call(arguments).map(
                v => $StringUtil.removeTrailingLeadingSlashes(v.toString())
            ),
            flags = args.slice(-1)[ 0 ],

            // We need to unitize the last matching string pair here
            flagArr = flags.split(/(\/)/),
            flagStr = flagArr.slice(-1)[ 0 ].match(/([giym]{0,4})/)[ 1 ];

        // Replace the clause in the last part of the passed array
        args[ args.length - 1 ] = flagArr[ 0 ];
        return new RegExp(args.join('\\/'), flagStr);
    }

    /**
     * @desc $Routes.$$parseURLParams is a function that will strip the
     * paramters out of RegExp pattern routes
     *
     * It is a private method
     * @since 0.2.3
     * @param {string} t Template string to be processed
     * @returns {function} Template function, compiles in whatever scope is passed
     * @access private
     * @example $compile('{{{test}}}')({ test: 1 }) === 1; // true
     */
    static $$parseURLParams(pattern, path) {
        let obj = {};

        // If and only if the pattern and path exist
        if (pattern && path) {

            // Strip slashes
            $StringUtil.removeTrailingLeadingSlashes(
                path.replace(pattern, '$1|$2|$3|$4|$5')
            ).split('|').forEach(

                // Pull the paramter from the parsed replace string if there is
                // a match
                function(v, i) {
                    if (v.indexOf(`$${i + 1}`) === -1) {
                        obj[ i ] = v;
                    }
                }
            );
        }

        // Param keys are matched indices and flagged with keys 0-5
        return obj;
    }
}

export default $Routes;