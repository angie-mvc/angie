/**
 * @module $ExceptionsProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import chalk from           'chalk';
import $LogProvider from    'angie-log';

class $$InvalidConfigError {
    constructor() {
        const msg = 'Invalid application configuration. Check your ' +
            chalk.cyan('AngieFile');

        $LogProvider.error(msg);
        return new Error(msg);
    }
}

class $$InvalidModuleConfigError extends SyntaxError {
    constructor(type = 'directive', name) {
        super(chalk.bold(
            chalk.red(`Invalid configuration for ${type} ${chalk.cyan(name)}`)
        ));
    }
}

class $$InvalidServiceConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('service', name);
    }
}

class $$InvalidFactoryConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('factory', name);
    }
}

class $$InvalidControllerConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('Controller', name);
    }
}

class $$InvalidDirectiveConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('directive', name);
    }
}

export {
    $$InvalidConfigError,
    $$InvalidServiceConfigError,
    $$InvalidFactoryConfigError,
    $$InvalidControllerConfigError,
    $$InvalidDirectiveConfigError
};