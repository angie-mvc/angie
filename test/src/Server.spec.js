// Test Modules
import { assert, expect } from      'chai';
import simple, { mock, spy } from   'simple-mock';

// System Modules
import yargs from                   'yargs';
import http from                    'http';
import https from                   'https';
import $LogProvider from            'angie-log';

// Angie Modules
import app from                     '../../src/Angie';
import { $$server } from            '../../src/Server';
import $Request from                '../../src/services/$Request';
import * as $Responses from         '../../src/services/$Response';

describe('$$server', function() {
    const noop = () => false;
    let request,
        response,
        listen,
        timeoutMock,
        dataMock,
        routeMock,
        end,
        head,
        writeSync,
        e;

    beforeEach(function() {
        yargs([]);
        e = new Error();
        listen = spy(function() {
            return {
                catch(fn) { fn(e); }
            };
        });
        end = spy();
        request = {
            url: 'test',
            method: 'GET'
        };
        response = {
            end,
            _header: 'test'
        };
        mock(app, '$$load', function() {
            return {
                then(fn) { fn(); }
            };
        });
        mock(http, 'createServer', function(fn) {
            fn(request, response);
            return { listen };
        });
        mock(https, 'createServer', function(fn) {
            fn(request, response);
            return { listen };
        });
        timeoutMock = mock(global, 'setTimeout', () => true);
        mock(global, 'clearTimeout', () => true);
        dataMock = mock($Request.prototype, '$$data', function() {
            return {
                then(fn) {
                    fn();
                    return {
                        then(fn) {
                            fn();
                            return {
                                then(fn) {
                                    fn();
                                    return {
                                        catch(fn) {
                                            fn(e);
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        });
        routeMock = mock($Request.prototype, '$$route', noop);
        writeSync = spy();
        head = spy(function() {
            return { writeSync };
        });
        mock(
            $Responses,
            'ErrorResponse',
            function() {
                return { head };
            }
        );
        mock(
            $Responses,
            '$CustomResponse',
            function() {
                return { head };
            }
        );
        mock($Responses.default.prototype, 'constructor', function() {
            return { response };
        });
        mock(app, '$$tearDown', () => true);
        mock($LogProvider, 'error', () => true);
        mock($LogProvider, 'warn', () => true);
        mock($LogProvider, 'info', () => true);
    });
    afterEach(simple.restore);
    it('test call with http', function() {
        $$server([ 'server', 1234 ]);
        assert(app.$$load.called);
        assert(http.createServer.called);
        expect(https.createServer).to.not.have.been.called;
        assert(global.setTimeout.called);
        assert(global.clearTimeout.called);
        assert(dataMock.called);
        assert(routeMock.called);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        expect(
            $LogProvider.error.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        assert(head.called);
        assert(writeSync.called);
        expect(listen.calls[0].args[0]).to.eq(1234);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 1234');
    });
    it('test call with http and argument -p', function() {
        yargs([ '-p', '9999' ]);
        $$server([ 'server', 1234 ]);
        assert(app.$$load.called);
        assert(http.createServer.called);
        expect(https.createServer).to.not.have.been.called;
        assert(global.setTimeout.called);
        assert(global.clearTimeout.called);
        assert(dataMock.called);
        assert(routeMock.called);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        expect(
            $LogProvider.error.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        assert(head.called);
        assert(writeSync.called);
        expect(listen.calls[0].args[0]).to.eq(9999);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 9999');
    });
    it('test call with http and argument --port', function() {
        yargs([ '--port', '9999' ]);
        $$server([ 'server', 1234 ]);
        assert(app.$$load.called);
        assert(http.createServer.called);
        expect(https.createServer).to.not.have.been.called;
        assert(global.setTimeout.called);
        assert(global.clearTimeout.called);
        assert(dataMock.called);
        assert(routeMock.called);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        expect(
            $LogProvider.error.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        assert(head.called);
        assert(writeSync.called);
        expect(listen.calls[0].args[0]).to.eq(9999);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 9999');
    });
    it('test call with https and port 443', function() {
        $$server([ 'server', 443 ]);
        assert(app.$$load.called);
        expect(http.createServer).to.not.have.been.called;
        assert(https.createServer.called);
        assert(global.setTimeout.called);
        assert(global.clearTimeout.called);
        assert(dataMock.called);
        assert(routeMock.called);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        expect(
            $LogProvider.error.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        assert(head.called);
        assert(writeSync.called);
        expect(
            $LogProvider.error.calls[1].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        expect(listen.calls[0].args[0]).to.eq(443);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 443');
    });
    it('test call with https and --usessl', function() {
        yargs([ '--usessl' ]);
        $$server([ 'server', 1234 ]);
        assert(app.$$load.called);
        expect(http.createServer).to.not.have.been.called;
        assert(https.createServer.called);
        assert(global.setTimeout.called);
        assert(global.clearTimeout.called);
        assert(dataMock.called);
        assert(routeMock.called);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        expect(
            $LogProvider.error.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        assert(head.called);
        assert(writeSync.called);
        expect(
            $LogProvider.error.calls[1].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
        expect(listen.calls[0].args[0]).to.eq(443);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 443');
    });
    it('test < 400 level response', function() {
        response.statusCode = 399;
        $$server([ 'server', 1234 ]);
        expect(
            $LogProvider.info.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
    });
    it('test < 500 level response', function() {
        response.statusCode = 499;
        $$server([ 'server', 1234 ]);
        expect(
            $LogProvider.warn.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
    });
    it('test >= 500 or unknown level response', function() {
        response.statusCode = 500;
        $$server([ 'server', 1234 ]);
        expect(
            $LogProvider.error.calls[0].args
        ).to.deep.eq([ 'GET', 'test', 'test' ]);
    });
    it('test timeout response', function() {
        timeoutMock.callFn((fn) => fn());
        routeMock.returnWith({
            then() {
                return {
                    catch() {}
                };
            }
        });
        $$server([ 'server', 1234 ]);
        assert($Responses.$CustomResponse.called);
        expect(head.calls[0].args).to.deep.eq([ 504, null, {
            'Content-Type': 'text/html'
        } ]);
        expect(writeSync.calls[0].args[0]).to.eq('<h1>Gateway Timeout</h1>');
        expect($LogProvider.error.calls[0].args).to.deep.eq([ 'test', 'test' ]);
        assert(end.called);
    });
});