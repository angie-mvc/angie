// Test Modules
import {expect} from                'chai';
import simple, {mock} from          'simple-mock';

// System Modules
import $LogProvider from            'angie-log';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    $Routes =                       require(`../../../${TEST_ENV}/factories/routes`);

describe('$Routes', function() {
    describe('when', function() {
        before(() => $Routes.$$clear());
        afterEach(() => $Routes.$$clear());
        describe('string paths', function() {
            it('test string-based url path', function() {
                $Routes.when('/test', {
                    template: 'test'
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        '/test': {
                            template: 'test'
                        }
                    }
                });
            });
            it('test string-based child url path', function() {
                $Routes.when('/test', {
                    template: 'test',
                    test: {
                        template: 'test'
                    }
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        '/test': {
                            template: 'test'
                        },
                        '/test/test': {
                            template: 'test'
                        }
                    }
                });
            });
            it(
                'test string-based child url path inherits Controller',
                function() {
                    $Routes.when('/test', {
                        template: 'test',
                        Controller: 'test',
                        test: {
                            template: 'test'
                        }
                    });
                    expect($Routes.fetch()).to.deep.eq({
                        routes: {
                            '/test': {
                                template: 'test',
                                Controller: 'test'
                            },
                            '/test/test': {
                                template: 'test',
                                Controller: 'test'
                            }
                        }
                    });
                }
            );
            it(
                'test non-object child url paths without object values ignored',
                function() {
                    let route = {
                        template: 'test',
                        Controller: 'test',
                        test: 'test'
                    };
                    $Routes.when('/test', route);
                    expect($Routes.fetch()).to.deep.eq({
                        routes: {
                            '/test': {
                                template: 'test',
                                Controller: 'test'
                            }
                        }
                    });
                    expect(route.hasOwnProperty('test')).to.be.false;
                }
            );
        });
        describe('RegExp paths', function() {
            it('test RegExp-based url path', function() {
                $Routes.when(/[A-z]+.?/, {
                    template: 'test'
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        regExp: {
                            '/[A-z]+.?/': {
                                template: 'test',
                                flags: ''
                            }
                        }
                    }
                });
            });
            it('test RegExp-based url path with flags', function() {
                $Routes.when(/[A-z]+.?/gi, {
                    template: 'test'
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        regExp: {
                            '/[A-z]+.?/gi': {
                                template: 'test',
                                flags: 'gi'
                            }
                        }
                    }
                });
            });
            it('test regex-based regex child url path', function() {
                $Routes.when(/test/, {
                    template: 'test',
                    '/test/': {
                        template: 'test'
                    }
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        regExp: {
                            '/test/': {
                                template: 'test',
                                flags: ''
                            },
                            '/test\\/test/': {
                                template: 'test',
                                flags: ''
                            }
                        }
                    }
                });
            });
            it('test string-based regex child url path', function() {
                $Routes.when('test', {
                    template: 'test',
                    '/test/': {
                        template: 'test'
                    }
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        regExp: {
                            '/test\\/test/': {
                                template: 'test',
                                flags: ''
                            }
                        },
                        test: {
                            template: 'test'
                        }
                    }
                });
            });
            it('test string-based regex child url path with flags', function() {
                $Routes.when('test', {
                    template: 'test',
                    '/test/gi': {
                        template: 'test'
                    }
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        regExp: {
                            '/test\\/test/gi': {
                                template: 'test',
                                flags: 'gi'
                            }
                        },
                        test: {
                            template: 'test'
                        }
                    }
                });
            });
            it('test regex-based string child url path', function() {
                $Routes.when(/test/, {
                    template: 'test',
                    test: {
                        template: 'test'
                    }
                });
                expect($Routes.fetch()).to.deep.eq({
                    routes: {
                        regExp: {
                            '/test/': {
                                template: 'test',
                                flags: ''
                            },
                            '/test\\/test/': {
                                template: 'test',
                                flags: ''
                            }
                        }
                    }
                });
            });
            it(
                'test regex-based regex child url path inherits Controller',
                function() {
                    $Routes.when(/test/, {
                        template: 'test',
                        Controller: 'test',
                        '/test/': {
                            template: 'test'
                        }
                    });
                    expect($Routes.fetch()).to.deep.eq({
                        routes: {
                            regExp: {
                                '/test/': {
                                    template: 'test',
                                    Controller: 'test',
                                    flags: ''
                                },
                                '/test\\/test/': {
                                    template: 'test',
                                    Controller: 'test',
                                    flags: ''
                                }
                            }
                        }
                    });
                }
            );
        });
    });
    describe('$$stringsToRegExp', function() {
        let regExp = $Routes.$$stringsToRegExp;
        it('test convert strings to RegExp', function() {
            expect(regExp('test')).to.deep.eq(/test/);
            expect(regExp('test', 'test')).to.deep.eq(/test\/test/);
            expect(regExp('test', 'test', 'test')).to.deep.eq(/test\/test\/test/);
        });
        it('test convert RegExp to RegExp', function() {
            expect(regExp(/test/)).to.deep.eq(/test/);
            expect(regExp(/test/, /test/)).to.deep.eq(/test\/test/);
            expect(regExp(/test/, /test/, /test/)).to.deep.eq(/test\/test\/test/);
        });
        it('test convert strings/RegExp to RegExp', function() {
            expect(regExp('test', /test/, 'test')).to.deep.eq(/test\/test\/test/);
        });
    });
    describe('$$parseUrlParams', function() {
        let parse = $Routes.$$parseURLParams;

        it('test no pattern', function() {
            expect(parse(undefined, '/test.json')).to.deep.eq({});
        });
        it('test no path', function() {
            expect(parse(/test/, '/test.json')).to.deep.eq({});
        });
        it('test single param', function() {
            expect(parse(/(test).json/, '/test.json')).to.deep.eq({ 0: 'test' });
        });
        it('test numeric param', function() {
            expect(parse(/([0-9]).json/, '/5.json')).to.deep.eq({ 0: '5' });
        });
        it('test double param', function() {
            expect(
                parse(/(test)\/(test).json/, '/test/test.json')
            ).to.deep.eq({
                0: 'test',
                1: 'test'
            });
        });
        it('test five params', function() {
            expect(
                parse(
                    /(test)\/([0-9])\/([A-Z]+)\/([a-z])\/(blah).json/,
                    'test/1/TEST/m/blah.json'
                )
            ).to.deep.eq({
                0: 'test',
                1: '1',
                2: 'TEST',
                3: 'm',
                4: 'blah'
            });
        });

        // This is weird, but I'm not sure its a huge problem
        it('test unmatched param', function() {
            expect(
                parse(
                    /(test)\/([0-9]).json/,
                    'test/A.json'
                )
            ).to.deep.eq({
                0: 'test/A.json'
            });
        });
    });
    describe('otherwise', function() {
        beforeEach(() => mock($LogProvider, 'warn', function() {}));
        afterEach(function() {
            simple.restore();
            $Routes.$$clear();
        });
        it('test non-string otherwise is not set', function() {
            $Routes.otherwise({});
            expect($LogProvider.warn).to.have.been.called;
            expect($Routes.fetch().otherwise).to.be.undefined;
        });
        it('test string otherwise is set', function() {
            $Routes.otherwise('/test');
            expect($LogProvider.warn).to.not.have.been.called;
            expect($Routes.fetch().otherwise).to.eq('/test');
        });
    });
});