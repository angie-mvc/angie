// Test Modules
import { assert, expect } from  'chai';
import simple, { mock } from    'simple-mock';

// System Modules
import fs from                  'fs';
import $LogProvider from        'angie-log';

// Angie Modules
import { $FileUtil } from       '../../src/util/Util';
import Config, { config } from  '../../src/Config';

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
        expect(config).to.deep.eq({
            test: 'test',
            staticDirs: [],
            templateDirs: []
        });
    });
    it('test successful config load, js', function() {
        findMock.returnWith('test.js');
        expect(() => new Config()).to.throw();
        assert(findMock.called);
        assert(!readMock.called);
    });
});