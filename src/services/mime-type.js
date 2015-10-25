/**
 * @module mime-type.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

const MIME_TYPE = {
        atom: 'application/atom+xml',
        css: 'text/css',
        emcascript: 'application/emcascript',
        es6: 'application/emcascript',
        html: 'text/html',
        javascript: 'application/javascript',
        jpg: 'image/jpeg',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        rss: 'application/rss+xml',
        svg: 'image/svg+xml',
        xml: 'application/xml'
    },
    DEFAULT_TYPE = 'text/plain',

    /**
     * @desc $MimeTypeProvider is predominately used internally to specify a properties
     * mime type on response objects. It can also be used in special cases for
     * routing views.
     * @since 0.2.6
     * @access public
     * @example $MimeTypeProvider._('test.json'); // = 'application/json'
     */
    $MimeType = {

        /**
         * @desc Find a mime type based on ext
         * @since 0.2.6
         * @access private
         * @param {string} ext [param='html'] Content-Type to check against
         * @returns {string} An approximated Content-Type
         * @example $MimeTypeProvider._('json'); // = 'application/json'
         */
        $$(ext = '') {
            return MIME_TYPE[ ext.toLowerCase() ] || DEFAULT_TYPE;
        },

        /**
         * @desc Find a mime type based on a pathname
         * @since 0.2.6
         * @access public
         * @param {string} path File path to check against
         * @returns {string} An approximated Content-Type
         * @example $MimeTypeProvider._fromPath('test.json'); // = 'application/json'
         */
        fromPath(path) {
            return this.$$(
                path.indexOf('.') > -1 ? path.split('.').pop() : undefined
            );
        }
    };

export default $MimeType;