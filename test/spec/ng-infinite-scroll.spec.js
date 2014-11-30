// Adding a line just to make a new commit.
var fs = require('fs');
var mkdirp = require('mkdirp');

var itemsMarkup = '<p ng-repeat="item in items track by $index">{{$index}}</p>';
var template;
var tmpDir = '.tmp';
var pathToDocument = tmpDir + '/index.html';

describe('ng-infinite-scroll', function () {

  function getItems () {
    return element.all(by.repeater('item in items'));
  }

  function replace (block, content) {
    template = template.replace(new RegExp('(<!-- ' + block + ':start -->)[^]*(<!-- ' + block + ':end -->)', 'm'), '$1' + content + '$2');
    mkdirp(tmpDir);
    fs.writeFileSync(pathToDocument, template);
  }

  function scrollToBottomScript (container) {
    if (container === 'window') {
      return 'window.scrollTo(0, document.body.scrollHeight)';
    } else {
      return getElementByIdScript(container) + '.scrollTop = ' + calculateChildrenHeightScript(container);
    }
  }

  function getElementByIdScript (id) {
    return 'document.getElementById("' + id + '")';
  }

  function calculateChildrenHeightScript (container) {
    return '[].concat.apply([], ' + getElementByIdScript(container) + '.childNodes).map(function (el) { return el.offsetHeight ? el.offsetHeight : 0; }).reduce(function (cur, prev) { return prev + cur; }, 0)';
  }

  function scrollToLastScreenScript (container, offset) {
    if (container === 'window') {
      return 'window.scrollTo(0, document.body.scrollHeight - 2 * window.innerHeight + ' + offset + ')';
    } else {
      return getElementByIdScript(container) + '.scrollTop = ' + calculateChildrenHeightScript(container) + ' - 2 * ' + getElementByIdScript(container) + '.offsetHeight + ' + offset;
    }
  }

  function wrap (container, content) {
    if (container === 'window') {
      return content;
    } else if (container === 'parent') {
      return '<div id="parent" style="height: 50%; overflow: auto;">' + content + '</div>';
    } else if (container === 'ancestor') {
      return '<div id="ancestor" style="height: 50%; overflow: auto;"><div>' + content + '</div></div>';
    }
  }

  function getContainerAttr (container) {
    if (container === 'window') {
      return '';
    } else if (container === 'parent') {
      return 'infinite-scroll-parent';
    } else if (container === 'ancestor') {
      return 'infinite-scroll-container="\'#ancestor\'"';
    }
  }

  beforeEach(function () {
     template = fs.readFileSync('test/examples/index.html').toString();
  });

  ['1.2.0', '1.3.4'].forEach(function (angularVersion) {
    describe('with Angular ' + angularVersion, function () {
      beforeEach(function () {
        replace('angularjs', '<script src="http://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular.min.js"></script>');
      });
      ['window', 'ancestor', 'parent'].forEach(function (container) {
        describe('with ' + container + ' as container', function () {
          it('should be triggered immediately and when container is scrolled to the bottom', function () {
            replace('content', wrap(container, '<div infinite-scroll="loadMore()" ' + getContainerAttr(container) + '>' + itemsMarkup + '</div>'));
            browser.get(pathToDocument);
            expect(getItems().count()).toBe(100);
            browser.driver.executeScript(scrollToBottomScript(container));
            expect(getItems().count()).toBe(200);
          });

          it('does not trigger immediately when infinite-scroll-immediate-check is false', function () {
            replace('content', wrap(container, '<div infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" ' + getContainerAttr(container) + '>' + itemsMarkup + '</div>'));
            browser.get(pathToDocument);
            expect(getItems().count()).toBe(0);
            element(by.id('force')).click();
            expect(getItems().count()).toBe(100);
            browser.driver.executeScript(scrollToBottomScript(container));
            expect(getItems().count()).toBe(200);
          });

          it('respects the disabled attribute', function () {
            replace('content', wrap(container, '<div infinite-scroll="loadMore()" infinite-scroll-disabled="busy" ' + getContainerAttr(container) + '>' + itemsMarkup + '</div>'));
            browser.get(pathToDocument);
            expect(getItems().count()).toBe(0);
            element(by.id('action')).click();
            expect(getItems().count()).toBe(100);
          });

          it('respects the infinite-scroll-distance attribute', function () {
            replace('content', wrap(container, '<div infinite-scroll="loadMore()" infinite-scroll-distance="1" ' + getContainerAttr(container) + '>' + itemsMarkup + '</div>'));
            browser.get(pathToDocument);
            expect(getItems().count()).toBe(100);
            // 2 * window.innerHeight means that the bottom of the screen should be somewhere close to
            // body height - window height. That means that the top of the window is body height - 2 * window height.
            // Why can't we even set -10 here? Looks like it also takes the last element's height into account
            browser.driver.executeScript(scrollToLastScreenScript(container, -20));
            expect(getItems().count()).toBe(100);
            browser.driver.executeScript(scrollToLastScreenScript(container, 20));
            expect(getItems().count()).toBe(200);
          });
        });
      });
    });
  });
});
