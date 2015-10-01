/**
 * @module util.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from      'fs';
import util from    'util';

/**
 * @desc Util is a slient utility class which is not available via any provider
 * on the app object. The only way to access the methods on this class is to
 * import the module.
 * @extends util
 * @access private
 * @since 0.2.3
 */
class $Util {

    /**
     * @desc $Util empty function call helper
     * @since 0.2.3
     * @returns {undefined} undefined
     * @example $Util.noop(); // = undefined
     */
    static noop() {}
}
$Util = util._extend($Util, util);

/**
 * @desc Util is a silent utility class which is not available via any provider
 * on the app object. The only way to access the methods on this class is to
 * import the module. It holds methods quintessential to string manipulation.
 * @since 0.3.1
 */
class $StringUtil {

    /**
     * @desc Util helper to replace leading slashes
     * @since 0.2.3
     * @param {string} str [param=''] String to process
     * @returns {string} The str param with stripped leading slashes
     * @example 'test' === $StringUtil.removeTrailingLeadingSlashes('/test'); // true
     */
    static removeLeadingSlashes(str = '') {
        return str.replace(/(^(\/))/g, '');
    }

    /**
     * @desc Util helper to replace trailing slashes
     * @since 0.2.3
     * @param {string} str [param=''] String to process
     * @returns {string} The str param with stripped trailing slashes
     * @example 'test' === $StringUtil.removeTrailingLeadingSlashes('test/'); // true
     */
    static removeTrailingSlashes(str = '') {
        return str.replace(/((\/)$)/g, '');
    }

    /**
     * @desc Util helper to replace leading and trailing slashes
     * @since 0.2.3
     * @param {string} str [param=''] String to process
     * @returns {string} The str param with stripped trailing and leading slashes
     * @example 'test' === $StringUtil.removeTrailingLeadingSlashes('/test/'); // true
     */
    static removeTrailingLeadingSlashes(str = '') {
        return str.replace(/(^(\/)|(\/)$)/g, '');
    }

    /**
     * @desc Util helper to replace dash/slash separation with camelCase
     * @since 0.2.4
     * @param {string} str String to process
     * @returns {string} The str param converted to camelCase
     * @example $StringUtil.toCamel('test-test'); // = 'testTest'
     */
    static toCamel(str) {
        return str.toLowerCase().replace(
            /[-_][A-Za-z]/g, m => m.toUpperCase().replace(/[-_]/g, '')
        );
    }

    /**
     * @desc Util helper to replace camelCase with underscore_separation
     * @since 0.2.4
     * @param {string} str String to process
     * @returns {string} The str param converted to underscore_separation
     * @example $StringUtil.toCamel('testTest'); // = 'test_test'
     */
    static toUnderscore(str) {
        return this.toFormat(str, '_');
    }

    /**
     * @desc Util helper to replace camelCase with dash-separation
     * @since 0.2.4
     * @param {string} str String to process
     * @returns {string} The str param converted to dash-separation
     * @example $StringUtil.toDash('testTest'); // = 'test-test'
     */
    static toDash(str) {
        return this.toFormat(str, '-');
    }

    /**
     * @desc Util helper to perform `toDash` or `toUnderscore` style string
     * serilaization
     * @since 0.2.4
     * @param {string} str String to process
     * @param {string} del Character with which to replace camelCase capitals
     * @returns {string} The str param converted to `del` separation
     * @example $StringUtil.toFormat('testTest', '-'); // = 'test-test'
     * @example $StringUtil.toFormat('testTest', '_'); // = 'test_test'
     */
    static toFormat(str, del) {
        return str.replace(/([A-Z]+)/g, `${del}$1`).toLowerCase();
    }
}

/**
 * @desc $FileUtil is a silent utility class which is not available via any provider
 * on the app object. The only way to access the methods on this class is to
 * import the module. It holds methods quintessential to file management.
 * @since 0.3.1
 */
class $FileUtil {

    /**
     * @desc Util helper to help find files in the specified root
     * @since 0.2.4
     * @param {string} root The root directory in which to find files
     * @param {string} target The desired file name
     * @returns {string} The absolute path to the file
     * @example $FileUtil.find(process.cwd(), 'test');
     */
    static find(root, target) {

        // Handle slashes
        target = $StringUtil.removeTrailingLeadingSlashes(target);

        // Pull this out because it is used several times
        const fileDirectoryExists = function fileDirectoryExists(n, t) {
            try {
                return fs.lstatSync(n)[ `is${t}` ]();
            } catch(e) {
                return false;
            }
        };

        let path;
        if (target.indexOf('/') > -1) {

            // We can just search the root for the file
            path = `${root}/${target}`;
        } else {

            // If file has no slash, search in all directories
            const fn = function deepFindFile(root, target) {
                let files = fs.readdirSync(root);
                for (let i = 0; i < files.length; ++i) {
                    let file = files[i],
                        isDir = fileDirectoryExists(file, 'Directory');
                    if (isDir) {

                        // We have a directory and we need to recurse through it
                        fn(`${root}/${file}`, target);
                    } else if (file.indexOf(target) > -1) {
                        path = `${root}/${target}`;
                    }
                    if (path) {
                        break;
                    }
                }
            };

            // Recursively call for all roots
            fn(root, target);
        }

        // Check to see that the path we found is an actual file
        if (
            (path || path === '') &&
            fileDirectoryExists(path, 'File')
        ) {
            return path;
        }
    }
}

export default $Util;
export {
    $StringUtil,
    $FileUtil
};
