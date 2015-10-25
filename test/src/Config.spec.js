// Test Modules
import { assert, expect } from  'chai';
import simple, { mock } from    'simple-mock';

// System Modules
import fs from                  'fs';
import $LogProvider from        'angie-log';

// Angie Modules
const TEST_ENV =                global.TEST_ENV || 'src',
    $FileUtil =                 require(`../../${TEST_ENV}/util/util`).$FileUtil,
    $Config =                   require(`../../${TEST_ENV}/Config`),
    Config =                    $Config.default,
    config =                    $Config.config;

describe('Config', function() {
    const noop = () => false;
    let findMock,
        readMock,
        requireMock;

    beforeEach(function() {
        const obj = {
            test: 'test'
        };

        mock($LogProvider, 'error', noop);
        findMock = mock($FileUtil, 'find', () => 'test.json');
        readMock = mock(fs, 'readFileSync', () => JSON.stringify(obj));
        requireMock = mock(global, 'require', () => obj);
    });
    afterEach(simple.restore);
    it('test no file found', function() {
        simple.restore();
        findMock = mock($FileUtil, 'find', () => false);
        expect(() => new Config()).to.throw();
        assert(findMock.called);
    });
    it('test invalid JSON', function() {
        readMock.returnWith('}{');
        expect(() => new Config()).to.throw();
        assert(findMock.called);
        assert(readMock.called);
        assert(!requireMock.called);
    });
    it('test empty config', function() {
        readMock.returnWith('{}');
        expect(() => new Config()).to.throw();
        assert(findMock.called);
        assert(readMock.called);
        assert(!requireMock.called);
    });
    it('test successful config load, json', function() {
        new Config();
        assert(findMock.called);
        assert(readMock.called);
        assert(!requireMock.called);
        expect(config).to.be.an.object;
        expect(config.staticDirs).to.deep.eq([ 'static/' ]);
        expect(config.templateDirs).to.deep.eq([ 'templates/' ]);
    });
    xit('test successful config load, js', function() {
        findMock.returnWith('test.js');
        expect(() => new Config()).to.throw();
        assert(findMock.called);
        assert(!readMock.called);
    });
});