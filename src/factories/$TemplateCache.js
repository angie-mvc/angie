/**
 * @module $TemplateCache.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from                      'fs';
import {default as $Injector} from  'angie-injector';

// Angie Modules
import {config} from                '../Config';
import $CacheFactory from           './$CacheFactory';
import {
    $StringUtil,
    $FileUtil
} from                              '../util/util';

class $TemplateCache extends $CacheFactory {
    constructor() {
        super('templateCache');
    }
    get(url) {
        let template = super.get(url);
        if (!template) {
            template = $$templateLoader(url);
        }
        if (template && config.cacheStaticAssets) {
            this.put(url, template);
        }
        return template;
    }
}

/**
 * @desc $$templateLoader uses the $FileUtil static class to determine whether
 * or not an asset exists in the configured template and static directories. If
 * it does, it will return the asset. If `cacheStaticAssets` is enabled in the
 * AngieFile.json, it will then cache the found asset.
 * @since 0.3.2
 * @param {string} url The name of the relative path to the file
 * @param {string} [param='template'] type Is the url associated with a template
 * or a static asset? Options:
 *     'template':  Will load from declared `templateDirs`
 *     'static':    Will load from declared `staticDirs`
 * @returns {string|boolean} If the asset was found, the asset, otherwise `false`
 * @access private
 */
function $$templateLoader(url, type = 'template', encoding) {

    // Clone the template dirs
    const TEMPLATE_DIRS = $Injector.get(
        `ANGIE_${type === 'template' ? 'TEMPLATE' : 'STATIC'}_DIRS`
    );
    let template;

    // Deliberately use a for loop so that we can break out of it
    for (var i = TEMPLATE_DIRS.length - 1; i >= 0; --i) {
        let dir = TEMPLATE_DIRS[ i ],
            path = $FileUtil.find(dir, url);

        if (typeof path === 'string') {
            template = fs.readFileSync(path, encoding);
        }

        if (template) {
            break;
        }
    }

    if (!template) {
        return false;
    } else if (config.cacheStaticAssets === true) {
        new $CacheFactory('staticAssets').put(url, template);
    }
    return template;
}

/**
 * @desc $resourceLoader is a factory that will attach a JavaScript resource
 * to any respose. It will attach it inside of the body if the file is requested
 * to be attached on an HTML response.
 * @since 0.3.2
 * @todo Make this work with .css, .less, .scss, .haml
 * @todo Auto load Angular, jQuery, Underscore, etc. from their names alone
 * via Bower installs. Must create bower.json & bump bower version.
 * @param {string|Array} [param=10] filename Valid JS filename in Angie static
 * directories
 * @param {string} [param='src'] loadStyle How is this resource attached to the
 * document. Options:
 *     'src':       Include a script tag with the name of the resource
 *     'inline':    Include the resource content inline
 * @returns {boolean} Whether this function successfully finished (not an
 * indication that the resource was actually attached)
 * @access public
 * @example $resourceLoader('test.js');
 */
function $resourceLoader(files = [], loadStyle = 'src') {
    let [ $request, $response ] = $Injector.get('$request', '$response');
    if (
        !$request || typeof $request !== 'object' ||
        !$response || typeof $response !== 'object'
    ) {
        return false;
    } else if (!$response.content) {

        // Just in case the response property was not already defined
        $response.content = '';
    }

    if (typeof files === 'string') {
        files = [ files ];
    }

    files.forEach(function(resource) {

        // Return if not a js file
        if (resource.split('.').pop() !== 'js') {
            return;
        }

        // TODO put this into a template?
        let asset = '<script type="text/javascript"';
        if (loadStyle === 'src') {
            asset += ` src="${[
                $StringUtil.removeTrailingSlashes($request.path)
                    .replace(/([A-Za-z]+)/g, '..'),
                resource
            ].join('/')}">`;
        } else {
            let assetCache = new $CacheFactory('staticAssets'),
                assetPath = resource.split('/').pop(),
                staticAsset;
            asset += '>';
            if (assetCache.get(assetPath)) {
                staticAsset = assetCache.get(assetPath);
            } else {
                assetCache.put(
                    assetPath,
                    staticAsset = $$templateLoader(assetPath, 'static', 'utf8')
                );
            }

            if (staticAsset.length) {
                asset += staticAsset;
            }
        }

        asset += '</script>';

        const BODY = '</body>',
            STR = $response.content;
        if (STR.indexOf(BODY) > -1) {
            let body = STR.lastIndexOf(BODY);
            $response.content =
                `${STR.substr(0, body)}${asset}${STR.substr(body)}`;
        } else {
            $response.content = $response.content + asset;
        }
    });

    // For testing purposes
    return true;
}

const $templateCache = new $TemplateCache();
export {
    $templateCache,
    $$templateLoader,
    $resourceLoader
};
