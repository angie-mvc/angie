// Test Modules
import { assert, expect } from          'chai';
import simple, { mock, spy } from       'simple-mock';

// System Modules
import $Injector from                   'angie-injector';

// Angie Modules
import { config } from                  '../../../src/Config';
import * as $TemplateCache from         '../../../src/factories/$TemplateCache';
import $Response, {
    BaseResponse,
    AssetResponse,
    ControllerTemplateResponse,
    ControllerTemplatePathResponse,
    RedirectResponse,
    UnknownResponse,
    ErrorResponse,
    $CustomResponse
} from                                  '../../../src/services/$Response';
import { $FileUtil } from               '../../../src/util/util';

describe('$Response', function() {
    it('constructor', function() {
        expect(new $Response({})).to.deep.eq({
            response: { content: '' }
        });
    });
    describe('header', function() {
        let $response;

        beforeEach(function() {
            $response = new $Response({
                setHeader: spy()
            });
        });
        it('test header calls setHeader', function() {
            $response.header('k', 'v');
            expect(
                $response.response.setHeader.calls[0].args
            ).to.deep.eq([ 'k', 'v' ]);
        });
    });
});

describe('$Responses', function() {
    const noop = () => false;
    let $request,
        $response,
        $injectorMock,
        writeHeadSpy,
        writeSpy,
        response;

    beforeEach(function() {
        writeHeadSpy = spy();
        writeSpy = spy();
        $request = {
            headers: {
                accept: 'text/html,'
            },
            path: 'test.html'
        };
        $response = {
            test: 'test',
            $responseContent: '',
            writeHead: writeHeadSpy,
            write: writeSpy
        };
    });
    afterEach(simple.restore);
    describe('BaseResponse', function() {
        beforeEach(function() {
            $injectorMock =
                mock($Injector, 'get', () => [ $request, $response ]);
        });
        describe('constructor', function() {
            it('test content type from request.headers.accept', function() {
                response = new BaseResponse();
                expect(
                    response.response.$headers[ 'Content-Type' ]
                ).to.eq('text/html');
            });
            it('test content type no "," use request.path', function() {
                $injectorMock.returnWith([
                    {
                        headers: {
                            accept: 'text/plain'
                        },
                        path: 'test.html',
                        route: 'test',
                        otherwise: 'test'
                    },
                    $response
                ]);
                response = new BaseResponse();
                expect(response.path).to.eq('test.html');
                expect(response.route).to.eq('test');
                expect(response.otherwise).to.eq('test');
                expect(
                    response.response.$headers[ 'Content-Type' ]
                ).to.eq('text/html');
            });
            it('test content type empty headers use request.path', function() {
                $injectorMock.returnWith([
                    {
                        headers: {},
                        path: 'test.html'
                    },
                    $response
                ]);
                response = new BaseResponse();
                expect(
                    response.response.$headers[ 'Content-Type' ]
                ).to.eq('text/html');
            });
            it('test content type no headers use request.path', function() {
                $injectorMock.returnWith([
                    {
                        path: 'test.html'
                    },
                    $response
                ]);
                response = new BaseResponse();
                expect(
                    response.response.$headers[ 'Content-Type' ]
                ).to.eq('text/html');
            });
        });
        describe('methods', function() {
            let setHeaderSpy,
                writeSpy;

            beforeEach(function() {
                response = new BaseResponse();
                response.response = {
                    setHeader: setHeaderSpy = spy(),
                    write: writeSpy = spy(),
                    $headers: {
                        test: 'test'
                    }
                };
            });
            it('head', function() {
                expect(response.head()).to.eq(response);
                expect(response.response.statusCode).to.eq(200);
                expect(setHeaderSpy.callCount === 1);
                expect(setHeaderSpy.calls[0].args).to.deep.eq(
                    [ 'test', 'test' ]
                );
            });
            describe('write', function() {
                beforeEach(function() {
                    mock(response, 'writeSync', () => true);
                });
                it(
                    'test write calls response.writeSync',
                    function() {
                        response.write();
                        assert(response.writeSync.called);
                    }
                );
            });
            describe('writeSync', function() {
                beforeEach(function() {
                    mock($TemplateCache, '$$templateLoader', () => 'test');
                });
                it(
                    'test writeSync calls $$templateLoader',
                    function() {
                        response.writeSync();
                        expect(
                            $TemplateCache.$$templateLoader.calls[0].args[0]
                        ).to.eq('html/index.html');
                        expect(writeSpy.calls[0].args[0]).to.eq('test');
                    }
                );
            });
        });
    });
    describe('AssetResponse', function() {
        let BaseResponseMock;

        beforeEach(function() {
            BaseResponseMock = mock(
                BaseResponse.prototype,
                'constructor',
                () => true
            );
            $injectorMock = mock($Injector, 'get', () => $request);
        });
        describe('constructor', function() {
            it('test content type from request.headers.accept', function() {
                response = new AssetResponse();
                assert(BaseResponseMock.called);
                expect(response.path).to.eq('test.html');
            });
        });
        describe('methods', function() {
            let headMock;

            beforeEach(function() {
                headMock = mock(
                    BaseResponse.prototype,
                    'head',
                    () => response
                );
                response = new AssetResponse();
            });
            it('head', function() {
                expect(response.head()).to.eq(response);
                assert(headMock.called);
            });
            describe('write', function() {
                let $$templateLoaderMock;

                beforeEach(function() {
                    $$templateLoaderMock = mock(
                        $TemplateCache,
                        '$$templateLoader',
                        () => 'test'
                    );
                    response.response = $response;
                });
                afterEach(function() {
                    delete config.cacheStaticAssets;
                    simple.restore();
                });
                it('test no asset template', function() {
                    let headMock,
                        unknownWriteSpy = spy();
                    $$templateLoaderMock.returnWith(false);
                    mock(UnknownResponse.prototype, 'constructor', noop);
                    headMock = mock(
                        UnknownResponse.prototype,
                        'head',
                        () => ({ write: unknownWriteSpy })
                    );
                    response.write();
                    assert(headMock.called);
                    assert(unknownWriteSpy.called);
                });
                it('test asset from $$templateLoader', function() {
                    response.write();
                    assert(writeSpy.called);
                });
            });
        });
        describe('$isRoutedAssetResourceResponse', function() {
            let injectorMock,
                fileMock;

            beforeEach(function() {
                injectorMock = mock($Injector, 'get', () => [ 'test' ]);
                fileMock = mock($FileUtil, 'find', () => true);
            });
            it('test found asset', function() {
                expect(
                    AssetResponse.$isRoutedAssetResourceResponse('test')
                ).to.be.true;
                expect(fileMock.calls[0].args).to.deep.eq([ 'test', 'test' ]);
                expect(injectorMock.calls[0].args[0]).to.eq('ANGIE_STATIC_DIRS');
            });
            it('test did not find asset', function() {
                fileMock.returnWith(false);
                expect(
                    AssetResponse.$isRoutedAssetResourceResponse('test')
                ).to.be.false;
                expect(fileMock.calls[0].args).to.deep.eq([ 'test', 'test' ]);
                expect(injectorMock.calls[0].args[0]).to.eq('ANGIE_STATIC_DIRS');
            });
        });
    });
    describe('RedirectResponse', function() {
        let BaseResponseMock,
            $injectorMock;

        beforeEach(function() {
            BaseResponseMock = mock(
                BaseResponse.prototype,
                'constructor',
                function() {
                    this.otherwise = 'test2';
                }
            );
        });
        describe('constructor', function() {
            it('test with argument path', function() {
                let response = new RedirectResponse('test');
                assert(BaseResponseMock.called);
                expect(response.path).to.eq('test');
            });
            it('test without argument path', function() {
                let response = new RedirectResponse();
                assert(BaseResponseMock.called);
                expect(response.path).to.eq('test2');
            });
        });
        describe('methods', function() {
            beforeEach(function() {
                response = new RedirectResponse('test');

                $response.end = spy();
                $response.setHeader = spy();
                response.response = $response;
            });
            it('head', function() {
                expect(response.head()).to.eq(response);
                expect(response.response.statusCode).to.eq(302);
                expect(
                    $response.setHeader.calls[0].args
                ).to.deep.eq([ 'Location', 'test' ]);
            });
            it('write', function() {
                expect(response.write().then).to.be.a('function');
            });
            it('writeSync', function() {
                response.writeSync();
                assert($response.end.called);
            });
        });
    });
    describe('UnknownResponse', function() {
        let BaseResponseMock,
            $$templateLoaderMock;

        beforeEach(function() {
            BaseResponseMock = mock(BaseResponse.prototype, 'constructor', noop);
            $$templateLoaderMock = mock(
                $TemplateCache,
                '$$templateLoader',
                () => 'test'
            );
        });
        it('constructor', function() {
            let response = new UnknownResponse();
            assert(BaseResponseMock.called);
            expect($$templateLoaderMock.calls[0].args[0]).to.eq('html/404.html');
        });
        describe('methods', function() {
            beforeEach(function() {
                response = new UnknownResponse();
                response.response = $response;
            });
            it('head', function() {
                mock(BaseResponse.prototype, 'head', () => response);
                response.response.$headers = {};
                expect(response.head()).to.eq(response);
                expect(
                    BaseResponse.prototype.head.calls[0].args[0]
                ).to.eq(404);
            });
            it('write', function() {
                response.write();
                expect(writeSpy.calls[0].args[0]).to.eq('test');
            });
        });
    });
    describe('ErrorResponse', function() {
        let BaseResponseMock;

        beforeEach(function() {
            BaseResponseMock = mock(BaseResponse.prototype, 'constructor', noop);
        });
        describe('constructor', function() {
            afterEach(function() {
                delete config.development;
            });
            it('test no error', function() {
                let response = new ErrorResponse();
                assert(BaseResponseMock.called);
                expect(response.html).to.eq('<h1>Internal Server Error</h1>');
            });
            it('test error with stack', function() {
                config.development = true;
                let e = new Error('test'),
                    response = new ErrorResponse(e);
                assert(BaseResponseMock.called);
                expect(response.html).to.eq(`<h1>${e}</h1><p>${e.stack}</p>`);
            });
            it('test error without stack', function() {
                config.development = true;
                let e = new Error('test'),
                    response = new ErrorResponse('test');
                assert(BaseResponseMock.called);
                expect(response.html).to.eq('<h1>test</h1><p>No Traceback</p>');
            });
        });
        describe('methods', function() {
            beforeEach(function() {
                response = new ErrorResponse();
                response.response = $response;
            });
            it('head', function() {
                mock(BaseResponse.prototype, 'head', () => response);
                response.response.$headers = {};
                expect(response.head()).to.eq(response);
                expect(BaseResponse.prototype.head.calls[0].args[0]).to.eq(500);
            });
            it('write', function() {
                response.write();
                expect(writeSpy.calls[0].args[0]).to.eq(response.html);
            });
            it('writeSync', function() {
                response.writeSync();
                expect(writeSpy.calls[0].args[0]).to.eq(response.html);
            });
        });
    });
    describe('$CustomResponse', function() {
        let BaseResponseMock;

        beforeEach(function() {
            BaseResponseMock = mock(BaseResponse.prototype, 'constructor', noop);
        });
        it('constructor', function() {
            let response = new $CustomResponse();
            assert(BaseResponseMock.called);
        });
        describe('methods', function() {
            let html;

            beforeEach(function() {
                html = 'test';
                response = new $CustomResponse();
                response.response = $response;
            });
            describe('head', function() {
                beforeEach(function() {
                    response.response.$headers = {};
                    mock(BaseResponse.prototype, 'head', () => response);
                });
                it('test without headers', function() {
                    expect(response.head(504)).to.eq(response);
                    expect(
                        BaseResponse.prototype.head.calls[0].args[0]
                    ).to.eq(504);
                });
                it('test with additional response headers', function() {
                    let test = 'test';
                    expect(response.head(504, { test })).to.eq(response);
                    expect(response.response.$headers).to.deep.eq({ test });
                    expect(
                        BaseResponse.prototype.head.calls[0].args[0]
                    ).to.eq(504);
                });
            });
            it('write', function() {
                response.write(html);
                expect(writeSpy.calls[0].args[0]).to.eq(html);
            });
            it('writeSync', function() {
                response.writeSync(html);
                expect(writeSpy.calls[0].args[0]).to.eq(html);
            });
        });
    });
});