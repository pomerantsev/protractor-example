describe('ng-infinite-scroll', function () {
  it('should be triggered when page is scrolled to the bottom', function () {
    browser.get('test/examples/basic.html');
    var items = element.all(by.repeater('item in items'));
    expect(items.count()).toBe(100);
    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    expect(items.count()).toBe(200);
  });

  it('triggers immediately by default', function () {
    browser.get('test/examples/immediately.html');
    var items = element.all(by.repeater('item in items'));
    expect(items.count()).toBe(100);
  });

  it('does not trigger immediately when infinite-scroll-immediate-check is false', function () {
    browser.get('test/examples/immediate-check-off.html');
    var items = element.all(by.repeater('item in items'));
    expect(items.count()).toBe(0);
  });

  it('respects the disabled attribute', function () {
    browser.get('test/examples/disabled.html');
    var items = element.all(by.repeater('item in items'));
    expect(items.count()).toBe(0);
    element(by.id('action')).click();
    expect(items.count()).toBe(100);
  });
});
