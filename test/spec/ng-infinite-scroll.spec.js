describe('ng-infinite-scroll', function () {
  it('should be triggered when page is scrolled to the bottom', function () {
    browser.get('test/examples/basic.html');

    var items = element.all(by.repeater('item in items'));

    expect(items.last().getText()).toBe('100');

    browser.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');

    expect(items.last().getText()).toBe('200');
  });
});
