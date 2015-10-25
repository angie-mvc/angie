// Test Modules
import { expect } from              'chai';
import simple, { mock } from        'simple-mock';

// System Modules
import $Injector from               'angie-injector';
import $LogProvider from            'angie-log';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    config =                        require(`../../../${TEST_ENV}/Config`).config,
    app =                           require(`../../../${TEST_ENV}/Angie`).default,
    $compile =                      require(`../../../${TEST_ENV}/factories/$Compile`).default,
    $TemplateCache =                require(`../../../${TEST_ENV}/factories/$TemplateCache`),
    $Util =                         require(`../../../${TEST_ENV}/util/util`).default;

describe('$compile', function() {
    beforeEach(function() {
        mock($LogProvider, 'error', () => false);
    });
    afterEach(simple.restore);
    it(
        'test compile called without a template returns an empty function',
        function() {
            expect($compile()).to.deep.eq($Util.noop);
            expect($compile('')).to.deep.eq($Util.noop);
        }
    );
    it('test compile returns a function', function() {
        expect($compile('test')).to.be.a('function');
    });
    describe('template listeners', function() {
        let scope;

        beforeEach(function() {
            mock($Injector, 'get', () => ({}));
            mock($LogProvider, 'warn', function() {});
            scope = {
                test: 'test',
                test1: 'test1',
                test2: 'test2',
                test4: {
                    test: 'test4'
                },
                test5: 20,
                test6: 5
            };
        });
        afterEach(simple.restore);
        it('test no listeners', function() {
            $compile('test')(scope).then(function(t) {
                expect(t).to.eq('test');
            });
        });
        it('test listener with no matches', function() {
            $compile('{{{test3}}}')(scope).then(function(t) {
                expect(t).to.eq('');
                expect($LogProvider.warn).not.to.have.been.called;
            });
        });
        it('test $templateCompile evaluates a single matched listener', function() {
            $compile('{{{test}}}')(scope).then(function(t) {
                expect(t).to.eq('test');
            });
        });
        it('test $templateCompile evaluates multiple matched listeners', function() {
            $compile('{{{test}}} {{{test1}}} {{{test2}}}')(scope).then(function(t) {
                expect(t).to.eq('test test1 test2');
            });
        });
        it('test $templateCompile evaluates deep listeners', function() {
            $compile('{{{test4.test}}}')(scope).then(function(t) {
                expect(t).to.eq('test4');
            });
        });
        it('test listener with abnormal spacing', function() {
            $compile('{{{       test       }}}')(scope).then(function(t) {
                expect(t).to.eq('test');
            });
            $compile('        {{{    test4.    test     }}}')(scope).then(
                function(t) {
                    expect(t).to.eq('        test4');
                }
            );
        });
        it('test $templateCompile evaluates functional expressions', function() {
            $compile('{{{test4.test.indexOf(\'test1\') > -1}}}')(scope).then(
                function(t) {
                    expect(t).to.eq('false');
                }
            );
            $compile('{{{[ test, test1 ].join(\' & \')}}}')(scope).then(
                function(t) {
                    expect(t).to.eq('test & test1');
                }
            );
            $compile('{{{test.toUpperCase()}}}')(scope).then(function(t) {
                expect(t).to.eq('TEST');
            });
        });
        it('test $templateCompile evaluates binary expressions', function() {
            $compile('{{{test5}}}')(scope).then(function(t) {
                expect(t).to.eq('20');
            });
            $compile('{{{test5 * test6}}}')(scope).then(function(t) {
                expect(t).to.eq('100');
            });
            $compile('{{{test5 / test6}}}')(scope).then(function(t) {
                expect(t).to.eq('4');
            });
            $compile('{{{test5 + test6}}}')(scope).then(function(t) {
                expect(t).to.eq('25');
            });
            $compile('{{{test5 - test6}}}')(scope).then(function(t) {
                expect(t).to.eq('15');
            });
            $compile('{{{(test5 + test6) * test6}}}')(scope).then(function(t) {
                expect(t).to.eq('125');
            });
        });
    });
    describe('directive compilation', function() {
        beforeEach(function() {
            app.directive('testDir', {
                restrict: 'C',
                Controller: 'test',
                link: function(scope, el, attrs, done) {
                    attrs.test = 'test';
                    done();
                }
            });
        });
        afterEach(function() {
            app.$$tearDown('testDir');
        });
        it('test attribute unmatched directive', function() {
            $compile('<div test-dir></div>')({}).then(function(t) {
                expect(t).to.eq('<div test-dir=""></div>');
            });
        });
        it('test attribute matched directive', function() {
            app.directives.testDir.restrict = 'A';
            $compile('<div test-dir></div>')({}).then(function(t) {
                expect(t).to.eq('<div test-dir="" test="test"></div>');
            });
        });
        it('test element matched directive', function() {
            app.directives.testDir.restrict = 'E';
            $compile('<test-dir></test-dir>')({}).then(function(t) {
                expect(t).to.eq('<test-dir test="test"></test-dir>');
            });
        });
        it('test class matched directive', function() {
            $compile('<div class="testDir"></div>')({}).then(function(t) {
                expect(t).to.eq('<div class="testDir" test="test"></div>');
            });
        });
        it('test entire matched document', function() {
            $compile(
                '<!DOCTYPE html><html><head></head><body><div class="testDir"></div>' +
                '</body></html>'
            )({}).then(function(t) {
                expect(t).to.eq(
                    '<!DOCTYPE html><html><head></head><body>' +
                    '<div class="testDir" test="test"></div></body></html>'
                );
            });
        });
        it('test no directive link function', function() {
            delete app.directives.testDir.link;
            $compile('<div class="testDir"></div>')({}).then(function(t) {
                expect(t).to.eq('<div class="testDir"></div>');
            });
        });
        describe('directive template keyword', function() {
            beforeEach(function() {
                delete app.directives.testDir.link;
                app.directives.testDir.template = 'blah';
            });
            it('test directive template', function() {
                $compile('<div class="testDir"></div>')({}).then(function(t) {
                    expect(t).to.eq('<div class="testDir">blah</div>');
                });
            });
            it('test directive template with prepend', function() {
                app.directives.testDir.prepend = true;
                $compile('<div class="testDir">test</div>')({}).then(function(t) {
                    expect(t).to.eq('<div class="testDir">blahtest</div>');
                });
            });
            it('test directive template with parser', function() {
                app.directives.testDir.template = '{{{test}}}';
                $compile('<div class="testDir"></div>')({
                    test: 'test'
                }).then(function(t) {
                    expect(t).to.eq('<div class="testDir">test</div>');
                });
            });
        });
        describe('directive templatePath keyword', function() {
            beforeEach(function() {
                config.templateDirs = [];
                delete app.directives.testDir.link;
            });
            afterEach(function() {
                delete config.templateDirs;
            });
            it('test directive templatePath no ".html"', function() {
                app.directives.testDir.templatePath = 'test';
                $compile('<div class="testDir"></div>')({}).then(function(t) {
                    expect(t).to.eq('<div class="testDir"></div>');
                });
            });

            // TODO this should be tested using a mocked service
            it('test directive templatePath ".html"', function() {
                app.directives.testDir.templatePath =
                    'html/testDirectiveTemplatePath.html';
                mock($TemplateCache, '$$templateLoader', () => 'test');
                $compile('<div class="testDir"></div>')({}).then(function(t) {
                    expect(t).to.eq('<div class="testDir">test</div>');
                    expect(
                        $TemplateCache.$$templateLoader.calls[0].args[0]
                    ).to.eq(app.directives.testDir.templatePath);
                });
            });
        });
    });
});