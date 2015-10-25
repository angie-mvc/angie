/**
 * @module Server.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import os from                          'os';
import cluster from                     'cluster';
import repl from                        'repl';
import http from                        'http';
import https from                       'https';
import { argv } from                    'yargs';
import { Client } from                  'fb-watchman';
import { cyan } from                    'chalk';
import $Injector from                   'angie-injector';
import $LogProvider from                'angie-log';

// Angie Modules
import { config } from                  './Config';
import app from                         './Angie';
import $Request from                    './services/$Request';
import $Response, {
    ErrorResponse,
    $CustomResponse
} from                                  './services/$Response';

const RESPONSE_HEADER_MESSAGES = $Injector.get('RESPONSE_HEADER_MESSAGES'),
    CLIENT = new Client(),
    SUB = {
        expression: [
            'anyof', [ 'match', '*.js' ], [ 'match', '*.es6' ] ],
        fields: []
    };
let webserver,
    shell;

/**
 * @desc $$watch is an Angie implementation of Facebook Watchman for NodeJS.
 *
 * It is mentioned in the README that to use the `watch` command, it is
 * necessary to install the Watchman binaries.
 *
 * This is the function that fires when the `angie watch` command is issued. It
 * will subscribe to the target project folder by default. If passed the "devmode"
 * argument, the script will subscribe to the Angie source files.
 *
 * On change to, addition of, or removal of files from the subscribed to
 * directory, the $$watch function will restart the $$server/$$shell depending
 * on the issued action.
 * @since 0.3.2
 * @param {Array} [param=[]] args An array of CLI arguments piped into the
 * function
 * @access private
 */
function $$watch(args = []) {
    const PORT = $$port(args),
        ACTION = args[0] || 'watch',
        WATCH_DIR = argv.devmode || argv.d ? __dirname : process.cwd();

    // Check to see whether or not the config specifies the app as `development`
    // and we are creating a web server. If so, pose the user with a warning:
    if (config.development !== true && ACTION === 'watch') {
        $LogProvider.warn(
            `It is not necessary or wise to issue the ${cyan('watch')} ` +
            'command in production'
        );
    }

    return new Promise(function(resolve) {

        // Verify that the user actually has Facebook Watchman installed
        CLIENT.capabilityCheck({}, function (e, r) {
            if (e) {
                throw new Error(e);
            }
            resolve(r);
        });
    }).then(function() {
        return new Promise(function(resolve) {
            CLIENT.command([ `watch-project`, WATCH_DIR ], function (e, r) {
                if (e) {
                    throw new Error(e);
                }
                if ('warning' in r) {
                    $LogProvider.warn(r.warning);
                }
                resolve(r);
            });
        }).then(function(r) {
            $LogProvider.info(`Watch initiated on ${cyan(r.watch)}`);

            return new Promise(function(resolve) {
                CLIENT.command([
                    'subscribe',
                    r.watch,
                    `ANGIE_WATCH`,
                    SUB
                ], function (e, r) {
                    if (e) {
                        throw new Error(e);
                    }
                    resolve(r);
                });
            }).then(function() {
                CLIENT.on('subscription', function (r) {
                    if (r.subscription === 'ANGIE_WATCH') {

                        // Stop any existing webserver
                        if (webserver) {
                            webserver.close();
                        }

                        // Call the passed command to restart the watched
                        // process
                        (args[0] && args[0] === 'watch' ? $$server : $$shell)(
                            [ PORT ]
                        );
                    }
                });
            });
        });
    }).catch(function(e) {
        throw new Error(e);
    });
}

/**
 * @desc $$shell uses the NodeJS REPL to open an Angie-based shell
 *
 * Before load, the $$shell command will load all file dependencies of the
 * target application. All application components will be available in the
 * shell.
 *
 * The $$shell function is only called as a byproduct of the `angie watch`
 * command and will reload all application files on save, on creation, or on
 * removal in the directory specified to the $$watch function.
 * @since 0.3.2
 * @access private
 */
function $$shell() {
    const SHELL_PROMPT = 'angie > ';

    if (shell) {
        process.stdout.write('\n');
    }

    return app.$$load().then(function() {
        process.stdin.setEncoding('utf8');

        // Start a REPL after loading project files
        if (!shell) {
            shell = repl.start({
                prompt: SHELL_PROMPT,
                input: process.stdin,
                output: process.stdout
            });
        } else {
            process.stdout.write(SHELL_PROMPT);
        }
    });
}

/**
 * @desc $$cluster forks the standard webserver process allowing for many child
 * forks of the webserver to spin up. This is based on the native NodeJS cluster
 * module, which will spin up a new process for each of the CPUs on the host
 * machine.
 *
 * The master/child for cluster is self-forking by default. This insures that if
 * a fork goes down, the master will spin a new child fork up automatically,
 * allowing for more application resiliency. This may make it difficult to
 * restart the entire process as default shell exit commands will not take down
 * all of the forks.
 *
 * It is not recommended to use cluster in development.
 * @todo With binding and sockets, one must make sure that the clustered app
 * listens across all of it's listeners and clients broadcast to a broker or
 * all of the children
 * @since 0.4.5
 * @access private
 */
function $$cluster() {
    if (cluster.isMaster) {
        $LogProvider.info(
            `Starting ${cyan('cluster')} on ${os.cpus().length} core(s)`
        );

        if (config.development === true) {
            $LogProvider.warn(
                `It is not recommended to use ${cyan('cluster')} in development`
            );
        }

        os.cpus().forEach(cluster.fork);

        // We only want to refork if the user has not explicitly set the
        // `--no-refork` option
        if (!argv.hasOwnProperty('norefork')) {
            cluster.on('exit', cluster.fork);
        }
    } else {
        $$server();
    }
}

/**
 * @desc $$server uses the NodeJS http/https to open an Angie-based web server
 *
 * Before load, the $$server command will load all file dependencies of the
 * target application. All application components will be available to the
 * application running behind the server.
 *
 * The $$server function can be called as a byproduct of the `angie watch`
 * command in which case it will reload all application files on save,
 * on creation, or on removal in the directory specified to the $$watch function.
 * It can also be called independently of the Facebook Watchman application by
 * issuing the `angie server` or `angie s` commands from the CLI.
 * @todo add intentionally misleading X-Powered-By header?
 * @since 0.3.2
 * @param {Array} [param=[]] args An array of CLI arguments piped into the
 * function
 * @access private
 */
function $$server(args = []) {
    const PORT = $$port(args);

    // Load necessary app components
    app.$$load().then(function() {

        // Start a webserver, use http/https based on port
        webserver = (PORT === 443 ? https : http).createServer(function(req, res) {
            let $request = new $Request(req),

                // The service response instance
                $response = new $Response(res),

                // The base NodeJS response
                response = $response.response,
                requestTimeout;

            // Instantiate the request, get the data
            $request.$$data().then(function() {

                // We can set provisional headers here
                $response.header('X-Content-Type-Options', 'nosniff')
                    .header('X-XSS-Protection', '1; mode=block')
                    .header(
                        'Content-Security-Policy',
                        'default-src \'self\'; script-src \'self\';'
                    );

                // Set X-Frame-Options response header based on AngieFile
                if (typeof config.setXFrameOptions === 'string') {
                    $response.header('X-Frame-Options', config.setXFrameOptions);
                }

                // Add Angie components for the request and response objects
                app.service('$request', $request).service('$response', response);

                // Set a request error timeout so that we ensure every request
                // resolves to something
                requestTimeout = setTimeout(
                    forceEnd.bind(null, $request.path, response),
                    config.hasOwnProperty('responseErrorTimeout') ?
                        config.responseErrorTimeout : 5000
                );

            // Route the request
            }).then(() => $request.$$route()).then(function() {
                let code = response.statusCode,
                    log = 'error';

                // Clear the request error because now we are guaranteed some
                // sort of response
                clearTimeout(requestTimeout);

                // Provide log information based on the application response
                if (code < 400) {
                    log = 'info';
                } else if (code < 500) {
                    log = 'warn';
                }

                $LogProvider[ log ](
                    req.method,
                    $request.path,
                    response._header || ''
                );

                // Call this inside route block to make sure that we only
                // return once
                end(response);
            }).catch(function(e) {
                new ErrorResponse(e).head().writeSync();
                $LogProvider.error(
                    req.method,
                    $request.path,
                    response._header || ''
                );

                // Call this inside route block to make sure that we only
                // return once
                end(response);
            });
        }).listen(PORT);

        // Expose the webserver so that we can use it in sockets, etc.
        app.service('$server', webserver);

        // Info
        $LogProvider.info(`Serving on port ${PORT}`);

        function end(response) {

            // End the response
            response.end();

            // After we have finished with the response, we can tear down
            // request/response specific components
            app.$$tearDown('$request', '$response');
        }

        // Force an ended response with a timeout
        function forceEnd(path, response) {

            // Send a custom response for gateway timeout
            new $CustomResponse().head(504, null, {
                'Content-Type': 'text/html'
            }).writeSync(`<h1>${RESPONSE_HEADER_MESSAGES[ 504 ]}</h1>`);

            // Log something
            $LogProvider.error(path, response._header);

            // End the response
            end(response);
        }
    });
}

function $$port(args) {
    let port = +(argv.port || argv.p || args[ 1 ]);
    return argv.usessl ? 443 : !isNaN(port) ? port : 3000;
}

export {
    $$watch,
    $$cluster,
    $$server,

    // Exposed for testing purposes
    $$shell
};