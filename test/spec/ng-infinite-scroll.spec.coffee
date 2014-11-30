fs = require "fs"
mkdirp = require "mkdirp"

getTemplate = (angularVersion, container, attrs) ->
  """
    <!doctype html>
    <head>
      <style>
        html, body {
          height: 100%;
        }
      </style>
      <script src='http://ajax.googleapis.com/ajax/libs/angularjs/#{angularVersion}/angular.min.js'></script>
      <script src="../../lib/ng-infinite-scroll.js"></script>
      <script>
        angular.module('app', ['infinite-scroll'])
          .run(function ($rootScope) {
            $rootScope.items = [];
            $rootScope.loadMore = function () {
              [].push.apply($rootScope.items, new Array(100));
            };

            $rootScope.busy = true;

            $rootScope.enable = function () {
              $rootScope.busy = false;
            };
          });
      </script>
    </head>
    <body ng-app="app">
      <a id="action" ng-click="enable()">Enable</a>
      <a id="force" ng-click="loadMore()">Force</a>
      #{getContainerStart(container)}
        <div infinite-scroll="loadMore()" #{getContainerAttr(container)} #{attrs}>
          <p ng-repeat='item in items track by $index'>
            {{$index}}
          </p>
        </div>
      #{getContainerEnd(container)}
    </body>
  """

getItems = ->
  element.all(By.repeater "item in items")

scrollToBottomScript = (container) ->
  if container is "window"
    "window.scrollTo(0, document.body.scrollHeight)"
  else
    "#{getElementByIdScript(container)}.scrollTop = #{calculateChildrenHeightScript(container)}"

getElementByIdScript = (id) ->
  "document.getElementById('#{id}')"

calculateChildrenHeightScript = (container) ->
  "[].concat.apply([], #{getElementByIdScript(container)}.childNodes).map(function (el) { return el.offsetHeight ? el.offsetHeight : 0; }).reduce(function (cur, prev) { return prev + cur; }, 0)"

scrollToLastScreenScript = (container, offset) ->
  if container is "window"
    "window.scrollTo(0, document.body.scrollHeight - 2 * window.innerHeight + #{offset})"
  else
    "#{getElementByIdScript(container)}.scrollTop = #{calculateChildrenHeightScript(container)} - 2 * #{getElementByIdScript(container)}.offsetHeight + #{offset}"

getContainerStart = (container) ->
  if container is "window"
    ""
  else if container is "parent"
    "<div id='parent' style='height: 50%; overflow: auto;'>"
  else if container is "ancestor"
    "<div id='ancestor' style='height: 50%; overflow: auto;'><div>"

getContainerEnd = (container) ->
  if container is "window"
    ""
  else if container is "parent"
    "</div>"
  else if container is "ancestor"
    "</div></div>"

getContainerAttr = (container) ->
  if container is "window"
    ""
  else if container is "parent"
    "infinite-scroll-parent"
  else if container is "ancestor"
    "infinite-scroll-container='\"#ancestor\"'"

tmpDir = ".tmp"
pathToDocument = "#{tmpDir}/index.html"

describe "ng-infinite-scroll", ->
  for angularVersion in ["1.2.0", "1.3.4"]
    describe "with Angular #{angularVersion}", ->
      for container in ["window", "ancestor", "parent"]
        describe "with #{container} as container", ->
          it "should be triggered immediately and when container is scrolled to the bottom", ->
            fs.writeFileSync(pathToDocument, getTemplate(angularVersion, container, ""))
            browser.get pathToDocument
            expect(getItems().count()).toBe 100
            browser.driver.executeScript(scrollToBottomScript(container))
            expect(getItems().count()).toBe 200

          it "does not trigger immediately when infinite-scroll-immediate-check is false", ->
            fs.writeFileSync(pathToDocument, getTemplate(angularVersion, container, "infinite-scroll-immediate-check='false'"))
            browser.get pathToDocument
            expect(getItems().count()).toBe 0
            element(By.id("force")).click()
            expect(getItems().count()).toBe 100
            browser.driver.executeScript(scrollToBottomScript(container))
            expect(getItems().count()).toBe 200

          it "respects the disabled attribute", ->
            fs.writeFileSync(pathToDocument, getTemplate(angularVersion, container, "infinite-scroll-disabled='busy'"))
            browser.get pathToDocument
            expect(getItems().count()).toBe 0
            element(By.id("action")).click()
            expect(getItems().count()).toBe 100

          it "respects the infinite-scroll-distance attribute", ->
            fs.writeFileSync(pathToDocument, getTemplate(angularVersion, container, "infinite-scroll-distance='1'"))
            browser.get pathToDocument
            expect(getItems().count()).toBe 100
            # 2 * window.innerHeight means that the bottom of the screen should be somewhere close to
            # body height - window height. That means that the top of the window is body height - 2 * window height.
            # Why can't we even set -10 here? Looks like it also takes the last element's height into account
            browser.driver.executeScript(scrollToLastScreenScript(container, -20))
            expect(getItems().count()).toBe 100
            browser.driver.executeScript(scrollToLastScreenScript(container, 20))
            expect(getItems().count()).toBe 200
