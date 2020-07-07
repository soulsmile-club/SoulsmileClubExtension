var assert = require('assert');


describe('Notifications', function() {
    before(function () {
        this.jsdom = require('jsdom-global')()
        this.notifications = require('./public/notifications.js');
    });
    describe('#stripURL()', function() {
        it('Stripping basic amazon url', function() {
            var actual = this.notifications._test.stripURL('https://www.amazon.com');
            var expected = 'amazon.com';
            assert.equal(expected, actual);
        });
        it('Stripping amazon url without www', function() {
            var actual = this.notifications._test.stripURL('https://amazon.com');
            var expected = 'amazon.com';
            assert.equal(expected, actual);
        });
        it('Stripping product link for amazon url', function() {
            var productLink = 'https://www.amazon.com/Glad-Tall-Kitchen-Drawstring-Trash/dp/B00FQT4LX2/ref=lp_16310101_1_5_s_it?s=grocery&ie=UTF8&qid=1594088992&sr=1-5';
            var actual = this.notifications._test.stripURL(productLink);
            var expected = 'amazon.com';
            assert.equal(expected, actual);
        });
    });
});