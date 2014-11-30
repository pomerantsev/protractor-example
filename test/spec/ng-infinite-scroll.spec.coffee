fs = require "fs"
mkdirp = require "mkdirp"

itemsMarkup = "<p ng-repeat='item in items track by $index'>{{$index}}</p>"
template = undefined
tmpDir = ".tmp"
pathToDocument = "#{tmpDir}/index.html"

describe "ng-infinite-scroll", ->
  getItems = ->
    element.all(By.repeater "item in items")

  replace = (block, content) ->
    template = template.replace(new RegExp("(<!-- #{block}:start -->)[^]*(<!-- #{block}:end -->)", "m"), "$1#{content}$2")
    mkdirp tmpDir
    fs.writeFileSync(pathToDocument, template)

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

  wrap = (container, content) ->
    if container is "window"
      content
    else if container is "parent"
      "<div id='parent' style='height: 50%; overflow: auto;'>#{content}</div>"
    else if container is "ancestor"
      "<div id='ancestor' style='height: 50%; overflow: auto;'><div>#{content}</div></div>"

  getContainerAttr = (container) ->
    if container is "window"
      ""
    else if container is "parent"
      "infinite-scroll-parent"
    else if container is "ancestor"
      "infinite-scroll-container='\"#ancestor\"'"

  beforeEach ->
    template = fs.readFileSync("test/examples/index.html").toString()

  for angularVersion in ["1.2.0", "1.3.4"]
    describe "with Angular #{angularVersion}", ->
      beforeEach ->
        replace "angularjs", "<script src='http://ajax.googleapis.com/ajax/libs/angularjs/#{angularVersion}/angular.min.js'></script>"
      for container in ["window", "ancestor", "parent"]
        describe "with #{container} as container", ->
          it "should be triggered immediately and when container is scrolled to the bottom", ->
            replace "content", wrap(container, "<div infinite-scroll='loadMore()' #{getContainerAttr(container)}>#{itemsMarkup}</div>")
            browser.get pathToDocument
            expect(getItems().count()).toBe 100
            browser.driver.executeScript(scrollToBottomScript(container))
            expect(getItems().count()).toBe 200

          it "does not trigger immediately when infinite-scroll-immediate-check is false", ->
            replace "content", wrap(container, "<div infinite-scroll='loadMore()' infinite-scroll-immediate-check='false' #{getContainerAttr(container)}>#{itemsMarkup}</div>")
            browser.get pathToDocument
            expect(getItems().count()).toBe 0
            element(By.id("force")).click()
            expect(getItems().count()).toBe 100
            browser.driver.executeScript(scrollToBottomScript(container))
            expect(getItems().count()).toBe 200

          it "respects the disabled attribute", ->
            replace "content", wrap(container, "<div infinite-scroll='loadMore()' infinite-scroll-disabled='busy' #{getContainerAttr(container)}>#{itemsMarkup}</div>")
            browser.get pathToDocument
            expect(getItems().count()).toBe 0
            element(By.id("action")).click()
            expect(getItems().count()).toBe 100

          it "respects the infinite-scroll-distance attribute", ->
            replace "content", wrap(container, "<div infinite-scroll='loadMore()' infinite-scroll-distance='1' #{getContainerAttr(container)}>#{itemsMarkup}</div>")
            browser.get pathToDocument
            expect(getItems().count()).toBe 100
            # 2 * window.innerHeight means that the bottom of the screen should be somewhere close to
            # body height - window height. That means that the top of the window is body height - 2 * window height.
            # Why can't we even set -10 here? Looks like it also takes the last element's height into account
            browser.driver.executeScript(scrollToLastScreenScript(container, -20))
            expect(getItems().count()).toBe 100
            browser.driver.executeScript(scrollToLastScreenScript(container, 20))
            expect(getItems().count()).toBe 200
