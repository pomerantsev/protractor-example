describe('ng-infinite-scroll', function () {

  function getItems () {
    return element.all(by.repeater('item in items'));
  }

  it('should be triggered when page is scrolled to the bottom', function () {
    browser.get('test/examples/basic.html');
    var items = getItems();
    expect(items.count()).toBe(100);
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    expect(items.count()).toBe(200);
  });

  it('triggers immediately by default', function () {
    browser.get('test/examples/immediately.html');
    var items = getItems();
    expect(items.count()).toBe(100);
  });

  it('does not trigger immediately when infinite-scroll-immediate-check is false', function () {
    browser.get('test/examples/immediate-check-off.html');
    var items = getItems();
    expect(items.count()).toBe(0);
  });

  it('respects the disabled attribute', function () {
    browser.get('test/examples/disabled.html');
    var items = getItems();
    expect(items.count()).toBe(0);
    element(by.id('action')).click();
    expect(items.count()).toBe(100);
  });

  it('respects the infinite-scroll-distance attribute', function () {
    browser.get('test/examples/distance.html');
    var items = getItems();
    expect(items.count()).toBe(100);
    // 2 * window.innerHeight means that the bottom of the screen should be somewhere close to
    // body height - window height. That means that the top of the window is body height - 2 * window height.
    // Why can't we even set -10 here? Looks like it also takes the last element's height into account
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight - 2 * window.innerHeight - 20)');
    expect(items.count()).toBe(100);
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight - 2 * window.innerHeight)');
    expect(items.count()).toBe(200);
  });
});
