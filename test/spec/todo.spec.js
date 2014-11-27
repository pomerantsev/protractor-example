describe('first test', function() {
  it('should pass', function() {
    browser.get('test/examples/first/index.html');

    // element(by.model('todoText')).sendKeys('write a protractor test');
    // element(by.css('[value="add"]')).click();

    // var todoList = element.all(by.repeater('todo in todos'));
    // expect(todoList.count()).toEqual(3);
    // expect(todoList.get(2).getText()).toEqual('write a protractor test');
    element(by.css('[data="button"]')).click();
    expect(element(by.css('[data="message"]')).getText()).toEqual('Hello');
  });
});
