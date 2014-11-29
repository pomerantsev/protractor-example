var fs = require('fs');

var itemsMarkup = '<p ng-repeat="item in items track by $index">{{$index}}</p>';
var pathToDocument = 'test/examples/index.html';

describe('ng-infinite-scroll', function () {

  function getItems () {
    return element.all(by.repeater('item in items'));
  }

  function replace (block, content) {
    var fileContents = fs.readFileSync(pathToDocument).toString();
    var modifiedContents = fileContents.replace(new RegExp('(<!-- ' + block + ':start -->)[^]*(<!-- ' + block + ':end -->)', 'm'), '$1' + content + '$2');
    fs.writeFileSync(pathToDocument, modifiedContents);
  }

  // This should be handled by afterAll, which Jasmine lacks
  afterEach(function () {
    replace('content', '');
  });

  it('should be triggered immediately and when page is scrolled to the bottom', function () {
    replace('content', '<div infinite-scroll="loadMore()">' + itemsMarkup + '</div>');
    browser.get(pathToDocument);
    expect(getItems().count()).toBe(100);
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    expect(getItems().count()).toBe(200);
  });

  it('does not trigger immediately when infinite-scroll-immediate-check is false', function () {
    replace('content', '<div infinite-scroll="loadMore()" infinite-scroll-immediate-check="false">' + itemsMarkup + '</div>');
    browser.get(pathToDocument);
    expect(getItems().count()).toBe(0);
  });

  it('respects the disabled attribute', function () {
    browser.get('test/examples/disabled.html');
    expect(getItems().count()).toBe(0);
    element(by.id('action')).click();
    expect(getItems().count()).toBe(100);
  });

  it('respects the infinite-scroll-distance attribute', function () {
    browser.get('test/examples/distance.html');
    expect(getItems().count()).toBe(100);
    // 2 * window.innerHeight means that the bottom of the screen should be somewhere close to
    // body height - window height. That means that the top of the window is body height - 2 * window height.
    // Why can't we even set -10 here? Looks like it also takes the last element's height into account
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight - 2 * window.innerHeight - 20)');
    expect(getItems().count()).toBe(100);
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight - 2 * window.innerHeight)');
    expect(getItems().count()).toBe(200);
  });
});
