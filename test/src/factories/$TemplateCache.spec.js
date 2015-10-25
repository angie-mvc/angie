// Test Modules
import { expect, assert } from      'chai';
import simple, { mock } from        'simple-mock';

// System Modules
import fs from                      'fs';
import $Injector from               'angie-injector';

// Angie Modules
import { config } from              '../../../src/Config';
import $CacheFactory from           '../../../src/factories/$CacheFactory';
import {
    $$templateLoader,
    $resourceLoader
} from                              '../../../src/factories/$TemplateCache';
import { $FileUtil } from           '../../../src/util/util';

describe('$TemplateCache', function() {
    describe('$$templateLoader', function() {
        const test = () => 'test';
        let injectorMock,
            fileMock;


        beforeEach(function() {
            injectorMock = mock($Injector, 'get', () => [ test() ]);
            fileMock = mock($FileUtil, 'find', test);
            mock(fs, 'readFileSync', test);
            mock($CacheFactory.prototype, 'put', () => false);
        });
        afterEach(simple.restore);
        it('test no template dirs', function() {
            injectorMock.returnWith([]);
            expect($$templateLoader('test')).to.be.false;
            assert(!fileMock.called);
        });
        it('test no file found from $FileUtil', function() {
            injectorMock.returnWith([ 'test' ]);
            fileMock.returnWith(false);
            expect($$templateLoader('test')).to.be.false;
            assert(fileMock.called);
            assert(!fs.readFileSync.called);
        });
        it('test non-string file path', function() {
            injectorMock.returnWith([ 'test' ]);
            fileMock.returnWith({});
            expect($$templateLoader('test')).to.be.false;
            assert(fileMock.called);
            assert(!fs.readFileSync.called);
            expect(!$CacheFactory.prototype.put.called);
        });
        it('test file found, template returned', function() {
            injectorMock.returnWith([ 'test' ]);
            fileMock.returnWith('test');
            expect($$templateLoader('test')).to.eq('test');
            assert(fileMock.called);
            expect(
                fs.readFileSync.calls[0].args
            ).to.deep.eq([ 'test', undefined ]);
            expect(!$CacheFactory.prototype.put.called);
        });
        it('test file found, template returned, called with encoding', function() {
            injectorMock.returnWith([ 'test' ]);
            fileMock.returnWith('test');
            expect($$templateLoader('test', 'templates', 'utf8')).to.eq('test');
            assert(fileMock.called);
            expect(
                fs.readFileSync.calls[0].args
            ).to.deep.eq([ 'test', 'utf8' ]);
            expect(!$CacheFactory.prototype.put.called);
        });
        it('test file found, static asset, no config cache', function() {
            injectorMock.returnWith([ 'test' ]);
            fileMock.returnWith('test');
            expect($$templateLoader('test', 'static')).to.eq('test');
            assert(fileMock.called);
            expect(
                fs.readFileSync.calls[0].args
            ).to.deep.eq([ 'test', undefined ]);
            expect(!$CacheFactory.prototype.put.called);
        });
        it('test file found, config cache', function() {
            config.cacheStaticAssets = true;
            injectorMock.returnWith([ 'test' ]);
            fileMock.returnWith('test');
            expect($$templateLoader('test')).to.eq('test');
            assert(fileMock.called);
            expect(
                fs.readFileSync.calls[0].args
            ).to.deep.eq([ 'test', undefined ]);
            expect(
                $CacheFactory.prototype.put.calls[0].args
            ).to.deep.eq([ 'test', 'test' ]);
        });
    });
    describe('$resourceLoader', function() {
        let $request,
            $response,
            $injectorMock;

        beforeEach(function() {
            $request = { path: '/' };
            $response = {};
            $injectorMock = mock($Injector, 'get', () => [ $request, $response ]);
        });
        afterEach(function() {
            simple.restore();
        });
        it('test no $request', function() {
            $injectorMock.returnWith([ null, {} ]);
            expect($resourceLoader()).to.be.false;
        });
        it('test no $response', function() {
            $injectorMock.returnWith([ {}, null ]);
            expect($resourceLoader()).to.be.false;
        });
        it('test non-object $request', function() {
            $request = '';
            expect($resourceLoader()).to.be.false;
        });
        it('test non-object $response', function() {
            $response = '';
            expect($resourceLoader()).to.be.false;
        });
        it('test non-js file', function() {
            expect($resourceLoader('test')).to.be.true;
            expect($response.content).to.eq('');
        });
        it('test single file string src', function() {
            $response.content = 'TEST';
            expect($resourceLoader('test.js')).to.be.true;
            expect($response.content).to.eq(
                'TEST<script type="text/javascript" src="/test.js"></script>'
            );
        });
        it('test single file string src non-root path', function() {
            $response.content = 'TEST';
            $request.path = '/index/test';
            expect($resourceLoader('test.js')).to.be.true;
            expect($response.content).to.eq(
                'TEST<script type="text/javascript" src="/../../test.js"></script>'
            );
        });
        it('test array of files string src', function() {
            $response.content = 'TEST';
            expect($resourceLoader([ 'test.js', 'test1.js' ])).to.be.true;
            expect($response.content).to.eq(
                'TEST<script type="text/javascript" src="/test.js"></script>' +
                '<script type="text/javascript" src="/test1.js"></script>'
            );
        });
        it('test single file string src with </body>', function() {
            $response.content = '</body>';
            expect($resourceLoader('test.js')).to.be.true;
            expect($response.content).to.eq(
                '<script type="text/javascript" src="/test.js"></script></body>'
            );
        });
    });
});