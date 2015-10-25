/**
 * @module $Request.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import url from                     'url';
import { Form } from                'multiparty';

// Angie Modules
import $Routes from                 '../factories/routes';
import * as $Responses from         './$Response';
import $Util, { $StringUtil } from  '../util/util';

/**
 * @desc The $Request class processes all of the incoming Angie requests. It
 * can be required using a module import, but probably should not be unless it
 * is being subclassed for a dependency package. It can also be used as an
 * injected provider using `$request`.
 * @since 0.0.1
 * @access private
 */
class $Request {
    constructor(request) {
        let $routes;

        $Util._extend(this, request);
        this.$$request = request;

        // Define URI
        this.url = request.url;
        this.path = url.parse(this.url).pathname;

        // Parse query params out of the url
        this.query = url.parse(this.url, true).query;

        $routes = $Routes.fetch();

        // Declare the routes on the local request object
        this.routes = $routes.routes;
        this.otherwise = $routes.otherwise;
    }

    /**
     * @desc Returns a rerouted request which will perform a site redirect on
     * the front end.
     * @since 0.4.0
     * @param {string} path The relative or absolute path to which the Response
     * is redirected.
     * @access private
     */
    $redirect(path) {
        return new $Responses.RedirectResponse(path).head().writeSync();
    }

    /**
     * @desc Performs the routing of all Angie requests
     * @since 0.4.0
     * @access private
     */
    $$route() {

        // Check against all of the RegExp routes in Reverse
        let regExpRoutes = Object.keys(this.routes.regExp || {}).reverse();

        for (let i = 0; i < regExpRoutes.length; ++i) {

            // Slice characters we do not need to instantiate a new RegExp
            let regExpRoute =
                $StringUtil.removeTrailingLeadingSlashes(regExpRoutes[ i ]),

                // Cast the string key of the routes.regExp object as a
                // RegExp object and add any matching flags
                pattern = new RegExp(
                    regExpRoute,
                    this.routes.regExp[ regExpRoutes[ i ] ].flags
                );

            if (pattern.test(this.path)) {
                this.route = this.routes.regExp[ regExpRoutes[ i ] ];

                // Hooray, we've set our route, now we need to do some additional
                // param parsing
                $Util._extend(
                    this.query,
                    $Routes.$$parseURLParams(pattern, this.path)
                );

                break;
            }
        }

        // Check for a matching string path
        if (!this.route && this.routes[ this.path ]) {
            this.route = this.routes[ this.path ];
        }

        // Route the request based on whether the route exists and what the
        // route states its response should contain.
        let ResponseType;
        try {
            if (this.route) {
                ResponseType = 'ControllerTemplate';
                if (this.route.templatePath) {
                    ResponseType += 'Path';
                }
            } else if (
                $Responses.AssetResponse.$isRoutedAssetResourceResponse(
                    this.path
                )
            ) {
                ResponseType = 'Asset';
            } else if (this.otherwise) {
                return new $Responses.RedirectResponse().head().writeSync();
            } else {
                ResponseType = 'Unknown';
            }

            // Perform the specified response type
            return new $Responses[ `${ResponseType}Response` ]().head().write();
        } catch(e) {

            // Throw an error response if no other response type was specified
            return new $Responses.ErrorResponse(e).head().write();
        }
    }

    $$data() {
        let me = this,
            request = this.$$request,
            proms = [],
            prom;
        delete this.$$request;
        request.body = '';
        request.formData = {};

        prom = new Promise(function(resolve) {
            let body = '';
            request.on('data', function(d) {
                body += d;
                if (body.length > 1E6) {
                    request.connection.destroy();
                    throw new Error();
                }
            });
            request.on('end', function() {
                me.body = request.body = body;
                resolve();
            });
        });

        proms.push(prom);

        prom = new Promise(function(resolve) {
            try {
                new Form().parse(request, function(e, ...data) {
                    resolve(data);
                });
            } catch(e) {
                resolve([]);
            }
        })

        proms.push(prom);
        prom.then(function() {
            let rawData = arguments[0][0] || {},
                files = arguments[0][1] || {},
                formData = {};
            for (let field in rawData) {
                formData[ field ] = typeof rawData[ field ] === 'object' ?
                    rawData[ field ][0] : rawData[ field ];
            }
            me.formData = request.formData = formData;
            me.files = request.files = files;
        });

        return Promise.all(proms);
    }
}

export default $Request;