'use strict'; 'use strong';

// System Modules
import http from                    'http';
import https from                   'https';
import url from                     'url';
import chalk from                   'chalk';
import watch from                   'node-watch';
import $LogProvider from            'angie-log';

// Angie Modules
import {config} from                './Config';
import app from                     './Angular';
import $cacheFactory from           './services/$CacheFactory';
import {_templateLoader} from       './services/$TemplateCache';
import {
    BaseRequest,
    RESPONSE_HEADER_MESSAGES,
    PRAGMA_HEADER,
    NO_CACHE_HEADER
} from                              './services/BaseRequest';
import util from                    './util/util';
import {default as $MimeType} from  './util/$MimeTypeProvider';

const p = process;
let firstrun = true;

function server(args) {
    const useSSL = /\-+usessl/i.test(args),
          port = useSSL ? 443 : !isNaN(args[1]) ? +args[1] : 3000;

    if (firstrun) {
        $LogProvider.warn(
            `${chalk.cyan('angie server')} not suitable for production use.`
        );
    }

    app.$$load().then(function() {

        // Start a webserver
        // TODO run the webserver with Gulp and gulp watch project files and angie files to reload
        (useSSL ? https : http).createServer(function(request, response) {
            const path = url.parse(request.url).pathname;
            let angieResponse = new BaseRequest(path, request, response),
                asset;

            // A file cannot be in the static path if it doesn't have an extension, shortcut
            // TODO you may want to move the asset loading block out of here
            if (path.indexOf('.') > -1) {
                let assetCache = new $cacheFactory('staticAssets');

                if (assetCache.get(path)) {
                    asset = assetCache.get(path);
                } else {
                    asset = _templateLoader(path, 'static');
                }

                // We have an asset and must render a response
                if (asset) {

                    // Set the content type
                    angieResponse.responseHeaders[ 'Content-Type' ] =
                        $MimeType.fromPath(path);

                    // We do not want to cache responses
                    if (
                        config.hasOwnProperty('cacheStaticAssets') &&
                        !config.cacheStaticAssets
                    ) {
                        angieResponse.responseHeaders = util.extend(
                            angieResponse.responseHeaders,
                            {
                                Expires: -1,
                                Pragma: PRAGMA_HEADER,
                                'Cache-Control': NO_CACHE_HEADER
                            }
                        );
                    }

                    response.writeHead(
                        200,
                        RESPONSE_HEADER_MESSAGES[ '200' ],
                        angieResponse.responseHeaders
                    );

                    // Check if you have an image type asset
                    $LogProvider.info(path, response._header);
                    response.write(asset);
                }

                // End the response
                response.end();
                return;
            }

            // else {

            angieResponse._route().then(function() {
                let code = response.statusCode;
                if (!code) {
                    const error = _templateLoader('500.html');

                    // TODO extrapolate this to responses
                    response.writeHead(
                        500,
                        RESPONSE_HEADER_MESSAGES[ '500' ],
                        angieResponse.responseHeaders
                    );
                    response.write(error);
                    $LogProvider.error(path, response._header);
                } else if (code < 400) {
                    $LogProvider.info(path, response._header);
                } else if (code < 500) {
                    $LogProvider.warn(path, response._header);
                } else {
                    $LogProvider.error(path, response._header);
                }
                return true;
            }).then(function() {

                // End the response
                response.end();

                // TODO this seems to cause ERR_INCOMPLETE_CHUNKED_ENCODING
                // request.connection.end();
                // request.connection.destroy();
            });

            // }

        }).listen(port);

        // Attempt to restart the webserver on change
        if (firstrun) {
            let watchDirs = [ p.cwd(), __dirname ].concat(app._$dependencies__);

            try {
                let restartObj = {
                        persistent: true,
                        recursive: true
                    };
                watch(watchDirs, (() => restart(port)), restartObj);
            } catch(e) {
                $LogProvider.error(e);
            }
        }

        // Info
        $LogProvider.info(`Serving on port ${port}`);

        // Set firstrun to false
        firstrun = false;
    });
}

function restart(port) {

    // TODO this doesn't reload like you think it does
    app.$$load().then(function() {
        $LogProvider.info(
            `Application files reloaded; Still serving on port ${port}`
        );
    });
}

export default server;
