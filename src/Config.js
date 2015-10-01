/**
 * @module Config.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from                          'fs';

// Angie Modules
import { $FileUtil } from               './util/Util';
import { $$InvalidConfigError } from    './util/$ExceptionsProvider';

let config = {};

/**
 * @desc Instantiates the class that loads the AngieFile configs. This is an
 * internal class and the very first part of the application that is loaded.
 * None of the application will load if the AngieFile is missing or invalid.
 * @since 0.0.1
 * @access private
 */
class Config {

    /**
     * @desc Loads the AngieFile by name and parses its content
     * @since 0.0.1
     * @access private
     */
    constructor() {

        // Define the possible names for our config
        let fileNames = [
                'angiefile',
                'angieFile',
                'Angiefile',
                'AngieFile'
            ],
            acceptedFileNames = [],
            file,
            ext,
            content;
        fileNames.forEach(function(name) {

            // Add .es6 just in case we have lingering .es6 file users
            acceptedFileNames.push(`${name}.json`, `${name}.js`, `${name}.es6`);
        });

        // Cycle through all of the possible filenames, stopping on the first
        // match
        for (let i = acceptedFileNames.length - 1; i >= 0; --i) {

            // Check to see if we can find the absolute path to our configs
            file = $FileUtil.find(process.cwd(), acceptedFileNames[ i ]);
            if (file) {

                // Get the file extension, so we know how to parse the configs
                ext = file.split('.').pop();
                break;
            }
        }

        try {
            console.log('TEST', ext, file);
            if (ext === 'json') {
                config = JSON.parse(fs.readFileSync(file, 'utf8'));
            } else {
                config = require(file);
            }
        } catch(e) {
            console.log(e);
            throw new $$InvalidConfigError();
        } finally {
            if (Object.keys(config).length) {

                // Set the template and static dirs to something if they do not
                // exist
                config.templateDirs = config.templateDirs || [];
                config.staticDirs = config.staticDirs || [];
            } else {
                throw new $$InvalidConfigError();
            }
        }
    }
}

// Instantiate application configs based on AngieFile
new Config();

export default Config;
export { config };