/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// We need to require this before anything else
import './Config';

// System Modules
import { argv } from                'yargs';
import { exec } from                'child_process';
import { gray, bold } from          'chalk';
import $LogProvider from            'angie-log';

// Angie Modules
import $$createProject from         './util/scaffold/project';
import {
    $$watch,
    $$server
} from                              './Server';

let args = [];

// Remove trivial arguments
process.argv.forEach(function(v) {
    if (!v.match(/((babel-)?node|iojs|index|angie|--?)/)) {
        args.push(v);
    }
});

if (argv.help || argv.h) {
    help();
} else {

    // Route the CLI request to a specific command
    switch ((args[0] || '').toLowerCase()) {
        case 'help':
            help();
            break;
        case 'server':
            $$server(args);
            break;
        case 'watch':
            $$watch(args);
            break;
        case 's':
            $$server(args);
            break;
        case 'cluster':
            break;
        case 'createproject':
            $$createProject({
                name: args[ 1 ],
                dir: args[ 2 ]
            });
            break;
        case 'syncdb':
            require('angie-orm');
            break;
        case 'migrate':
            require('angie-orm');
            break;
        case 'test':
            runTests();
            break;
        case 'shell':
            watch();
            break;
        default:
            help();
    }
}

function runTests() {

    // TODO is there any way to carry the stream output from gulp instead
    // of capturing stdout?
    exec(`cd ${__dirname} && gulp`, function(e, std, err) {
        $LogProvider.info(std);
        if (err) {
            $LogProvider.error(err);
        }
        if (e) {
            throw new Error(e);
        }
    });
}

function help() {
    const GRAY = (...args) => console.log(gray.apply(null, args)),
        BOLD = (...args) => console.log(bold.apply(null, args));

    BOLD('Angie');
    console.log('A Module-Based NodeJS Web Application Framework in ES6');
    console.log('\r');
    BOLD('Version:');
    console.log(global.ANGIE_VERSION);
    console.log('\r');
    BOLD('Commands:');

    console.log('angie server [-p=<port>] [--port=<port>] [--usessl]');
    GRAY(
        'Start the Angie Webserver (shortcut with s). Default port ' +
        'is 3000. "usessl" forces the port to 443.'
    );

    console.log(
        'angie watch [-p=<port>] [--port=<port>] [-d] [--devmode] [--usessl]'
    );
    GRAY(
        'Starts the Angie Webserver as a watched process and watches the ' +
        'project directory. If started in "devmode," watch will target ' +
        'the Angie module "src" directory'
    );

    // TODO cluster help item
    // console.log('cluster [-p=<port>] [--port=<port>]');
    // gray('Start the Angie Webserver as a Cluster.');

    console.log('angie project [-n=<name>][--name=<name>] [--dir=<directory>]');
    console.log(
        'angie createproject [-n=<name>][--name=<name>] [--dir=<directory>]'
    );
    GRAY(
        'Create a new Angie project with the specified name in the ' +
        'current directory.'
    );

    console.log('angie test');
    GRAY(
        'Runs the Angie test suite and prints the results in the ' +
        'console'
    );
}