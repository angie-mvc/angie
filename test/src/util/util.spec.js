// Test Modules
import { expect } from              'chai';
import simple, { mock } from        'simple-mock';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    Util =                          require(`../../../${TEST_ENV}/util/util`),
    $Util =                         Util.default,
    $StringUtil =                   Util.$StringUtil;

describe('$Util', function() {
    it('noop', function() {
        expect($Util.noop()).to.be.undefined;
    });
});

describe('$StringUtil', function() {
    describe('removeLeadingSlashes', function() {
        let slashes;
        beforeEach(function() {
            slashes = $StringUtil.removeLeadingSlashes;
        });
        it('test called without any arguments', function() {
            expect(slashes()).to.eq('');
        });
        it('test leading slash', function() {
            expect(slashes('/test')).to.eq('test');
        });
        it('test many leading slashes', function() {
            expect(slashes('//test')).to.eq('/test');
        });
        it('test intra-string slashes', function() {
            expect(slashes('t/e/s/t')).to.eq('t/e/s/t');
        });
    });
    describe('removeTrailingSlashes', function() {
        let slashes;
        beforeEach(function() {
            slashes = $StringUtil.removeTrailingSlashes;
        });
        it('test called without any arguments', function() {
            expect(slashes()).to.eq('');
        });
        it('test trailing slash', function() {
            expect(slashes('test/')).to.eq('test');
        });
        it('test many trailing slashes', function() {
            expect(slashes('test//')).to.eq('test/');
        });
        it('test intra-string slashes', function() {
            expect(slashes('t/e/s/t')).to.eq('t/e/s/t');
        });
    });
    describe('removeTrailingLeadingSlashes', function() {
        let slashes;
        beforeEach(function() {
            slashes = $StringUtil.removeTrailingLeadingSlashes;
        });
        it('test called without any arguments', function() {
            expect(slashes()).to.eq('');
        });
        it('test leading slash', function() {
            expect(slashes('/test')).to.eq('test');
        });
        it('test many leading slashes', function() {
            expect(slashes('//test')).to.eq('/test');
        });
        it('test trailing slash', function() {
            expect(slashes('test/')).to.eq('test');
        });
        it('test many trailing slashes', function() {
            expect(slashes('test//')).to.eq('test/');
        });
        it('test leading & trailing slashes', function() {
            expect(slashes('/test/')).to.eq('test');
        });
        it('test intra-string slashes', function() {
            expect(slashes('t/e/s/t')).to.eq('t/e/s/t');
        });
    });
    describe('toCamel', function() {
        it('test a non-camel string', function() {
            expect($StringUtil.toCamel('test-test')).to.eq('testTest');
            expect($StringUtil.toCamel('test_test')).to.eq('testTest');
        });
        it('test an uppercase string', function() {
            expect($StringUtil.toCamel('TEST-TEST')).to.eq('testTest');
        });
        it('test no special chars', function() {
            expect($StringUtil.toCamel('testtest')).to.eq('testtest');
        });
    });
    describe('toUnderscore, toDash', function() {
        beforeEach(function() {
            mock($StringUtil, 'toFormat', function() {});
        });
        afterEach(function() {
            simple.restore();
        });
        it('test toUnderscore calls to format', function() {
            $StringUtil.toUnderscore('test');
            expect($StringUtil.toFormat).to.have.been.called;
        });
        it('test toDash calls to format', function() {
            $StringUtil.toDash('test');
            expect($StringUtil.toFormat).to.have.been.called;
        });
    });
    describe('toFormat', function() {
        it(
            'test toFormat properly formats camelCase to underscore_separation',
            function() {
                expect($StringUtil.toFormat('testTest', '_')).to.eq('test_test');
            }
        );
        it(
            'test toFormat properly formats camelCase to dash-separation',
            function() {
                expect($StringUtil.toFormat('testTest', '-')).to.eq('test-test');
            }
        );
    });
});