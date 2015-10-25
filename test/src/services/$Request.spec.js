// Test Modules
import { assert, expect } from      'chai';
import simple, { mock, spy } from   'simple-mock';

// System Modules
import { Form } from                'multiparty';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    $Routes =                       require(`../../../${TEST_ENV}/factories/routes`),
    $Responses =                    require(`../../../${TEST_ENV}/services/$Response`),
    $Request =                      require(`../../../${TEST_ENV}/services/$Request`),
    $Util =                         require(`../../../${TEST_ENV}/util/util`).default;

describe('$Request', function() {
    const noop = () => false;
    let req = {
            url: 'http://localhost:3000/test.html?id=1'
        };

    describe('constructor', function() {
        let request;

        beforeEach(function() {
            mock($Routes, 'fetch', () => ({
                routes: 'test',
                otherwise: 'test'
            }));
        });
        afterEach(simple.restore);
        it('test constructor declarations', function() {
            request = new $Request(req);
            expect(request.url).to.eq(req.url);
            expect(request.path).to.eq('/test.html');
            expect(request.query).to.deep.eq({ id: '1' });
            expect(request.routes).to.eq('test');
            expect(request.otherwise).to.eq('test');
        });
    });
    describe('$redirect', function() {
        let RedirectResponseMock,
            head,
            writeSync;

        beforeEach(function() {
            writeSync = spy();
            head = spy(function() {
                return { writeSync };
            });
            RedirectResponseMock = mock(
                $Responses,
                'RedirectResponse',
                function() {
                    return { head };
                }
            );
        });
        afterEach(simple.restore);
        it('test $redirect', function() {
            new $Request(req).$redirect('test');
            expect(RedirectResponseMock.calls[0].args[0]).to.eq('test');
            assert(head.called);
            assert(writeSync.called);
        });
    });
    describe('$$route', function() {
        let request,
            head,
            write,
            $isRoutedAssetResourceResponseMock;

        beforeEach(function() {
            write = spy();
            head = spy(function() {
                return { write };
            });
            $isRoutedAssetResourceResponseMock = mock(
                $Responses.AssetResponse,
                '$isRoutedAssetResourceResponse',
                () => false
            );
        });
        afterEach(simple.restore);
        describe('test UnknownResponse', function() {
            beforeEach(function() {
                request = new $Request(req);
                mock(
                    $Responses,
                    'UnknownResponse',
                    function() {
                        return { head };
                    }
                );

            });
            it('test no found route, no asset, no otherwise', function() {
                request.$$route();
                assert($Responses.UnknownResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test RedirectResponse', function() {
            let writeSync;

            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {}
                }));
                request = new $Request(req);
                writeSync = spy();
                head.returnWith({ writeSync });
                mock(
                    $Responses,
                    'RedirectResponse',
                    function() {
                        return { head };
                    }
                );
            });
            afterEach(simple.restore);
            it('test no found route, no asset with otherwise', function() {
                request.$$route();
                assert($Responses.RedirectResponse.called);
                assert(head.called);
                assert(writeSync.called);
            });
        });
        describe('test AssetResponse', function() {
            beforeEach(function() {
                $isRoutedAssetResourceResponseMock.returnWith(true);
                mock($Routes, 'fetch', () => ({ routes: {} }));
                request = new $Request(req);
                mock(
                    $Responses.AssetResponse.prototype,
                    'constructor',
                    function() {
                        return { head };
                    }
                );
            });
            afterEach(simple.restore);
            xit('test no found route, asset', function() {
                request.$$route();
                expect(
                    $isRoutedAssetResourceResponseMock.calls[0].args[0]
                ).to.eq('/test.html');
                assert($Responses.AssetResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test ControllerTemplateResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {
                        '/test': {
                            template: 'test'
                        },
                        regExp: {
                            '/([A-Za-z]+)/': {
                                template: 'test'
                            }
                        }
                    }
                }));
                mock($Routes, '$$parseURLParams', noop);
                mock($Util, '_extend', noop);
                request = new $Request(req);
                mock(
                    $Responses,
                    'ControllerTemplateResponse',
                    function() {
                        return { head };
                    }
                );
            });
            afterEach(simple.restore);
            it('test found route', function() {
                request.$$route();
                assert($Responses.ControllerTemplateResponse.called);
                assert(head.called);
                assert(write.called);
            });
            it('test regExp route', function() {
                request.$$route();
                assert($Util._extend.called);
                assert($Routes.$$parseURLParams.called);
            });
        });
        describe('test ControllerTemplatePathResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {
                        '/test': {
                            templatePath: 'test.html'
                        },
                        regExp: {}
                    }
                }));
                request = new $Request(req);
                request.path = '/test';
                mock(
                    $Responses,
                    'ControllerTemplatePathResponse',
                    function() {
                        return { head };
                    }
                );
            });
            afterEach(simple.restore);
            it('test found route', function() {
                request.$$route();
                assert($Responses.ControllerTemplatePathResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test ErrorResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {
                        '/test': {
                            template: 'test'
                        }
                    }
                }));
                request = new $Request(req);
                request.path = '/test';
                mock(
                    $Responses,
                    'ControllerTemplatePathResponse',
                    function() {
                        throw new Error();
                    }
                );
                mock(
                    $Responses,
                    'ErrorResponse',
                    function() {
                        return { head };
                    }
                );
            });
            afterEach(simple.restore);
            it('test error', function() {
                request.$$route();
                assert($Responses.ErrorResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
    });
    describe('$$data', function() {
        let destroy,
            request,
            data,
            end,
            formMock,
            test;

        beforeEach(function() {
            destroy = spy();
            req.connection = { destroy };
            request = new $Request(req);

            request.$$request.on = function(s, fn) {
                if (s === 'data') {
                    data = fn;
                } else {
                    end = fn;
                }
            };
            test = { test: 'test' };
            formMock = mock(Form.prototype, 'parse', function(_, fn) {
                return fn(null, test, test);
            });
            spy(Promise, 'all');
        });
        it('test $$data with raw data, errors', function() {
            formMock.callFn(function() {
                throw new Error();
            });

            request.$$data();
            expect(data).to.be.a.function;
            expect(end).to.be.a.function;

            let d = '_'.repeat(1E6 + 1);
            expect(data.bind(null, d)).to.throw();

            end();
            expect(req.body).to.eq(d);

            expect(req.formData).to.deep.eq({});
            expect(req.files).to.deep.eq({});

            expect(Promise.all.called);
        });
        it('test $$data with Array raw data, no errors', function() {
            formMock.callFn(function(_, fn) {
                return fn(null, { test: [ 'test' ] }, test);
            });

            request.$$data();
            expect(data).to.be.a.function;
            expect(end).to.be.a.function;

            let d = '_'.repeat(1E6 + 1);
            expect(data.bind(null, d)).to.throw();

            end();
            expect(req.body).to.eq(d);

            expect(req.formData).to.deep.eq(test);
            expect(req.files).to.deep.eq(test);

            expect(Promise.all.called);
        });
        it('test $$data with raw data, no errors', function() {
            request.$$data();
            expect(data).to.be.a.function;
            expect(end).to.be.a.function;

            let d = '_'.repeat(1E6 + 1);
            expect(data.bind(null, d)).to.throw();

            end();
            expect(req.body).to.eq(d);

            expect(req.formData).to.deep.eq(test);
            expect(req.files).to.deep.eq(test);

            expect(Promise.all.called);
        });
    });
});