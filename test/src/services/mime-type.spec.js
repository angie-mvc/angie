// Test Modules
import { expect } from              'chai';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    $MimeType =                     require(`../../../${TEST_ENV}/services/mime-type`);

describe('$MimeTypeProvider', function() {
    describe('$$', function() {
        it(
            'test $$ called without any arguments returns the default Content-Type',
            function() {
                expect($MimeType.$$()).to.eq('text/plain');
            }
        );
        it(
            'test $$ called with a type not in MIME$$TYPES returns default Content-Type',
            function() {
                expect($MimeType.$$('test')).to.eq('text/plain');
            }
        );
        it('test known mime type', function() {
            expect($MimeType.$$('svg')).to.eq('image/svg+xml');
        });
    });
    describe('fromPath', function() {
        it('test path without a "."', function() {
            expect($MimeType.fromPath('test')).to.eq('text/plain');
        });
        it('test path with a ".", but of unknown type', function() {
            expect($MimeType.fromPath('test.test')).to.eq('text/plain');
        });
        it('test path with a "." and of unknown type', function() {
            expect($MimeType.fromPath('test.svg')).to.eq('image/svg+xml');
        });
    });
});