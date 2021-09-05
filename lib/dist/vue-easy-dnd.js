var VueEasyDnD = (function (exports, reflectMetadata, vuePropertyDecorator) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * This is the class of the global object that holds the state of the drag and drop during its progress. It emits events
     * reporting its state evolution during the progress of the drag and drop. Its data is reactive and listeners can be
     * attachted to it using the method on.
     */
    var DnD = /** @class */ (function () {
        function DnD() {
            this.inProgress = false;
            this.type = null;
            this.data = null;
            this.source = null;
            this.top = null;
            this.position = null;
            this.eventBus = new vuePropertyDecorator.Vue();
            this.sourceListeners = null;
            this.success = null;
        }
        DnD.prototype.startDrag = function (source, event, x, y, type, data) {
            this.type = type;
            this.data = data;
            this.source = source;
            this.position = { x: x, y: y };
            this.top = null;
            this.sourceListeners = source.$listeners;
            this.inProgress = true;
            this.emit(event, "dragstart");
            this.emit(event, "dragtopchanged", { previousTop: null });
        };
        DnD.prototype.resetVariables = function () {
            this.inProgress = false;
            this.data = null;
            this.source = null;
            this.position = null;
            this.success = null;
        };
        DnD.prototype.stopDrag = function (event) {
            this.success = this.top !== null && this.top['compatibleMode'] && this.top['dropAllowed'];
            if (this.top !== null) {
                this.emit(event, "drop");
            }
            this.emit(event, "dragend");
            this.resetVariables();
        };
        DnD.prototype.cancelDrag = function (event) {
            this.success = false;
            this.emit(event, "dragend");
            this.resetVariables();
        };
        DnD.prototype.mouseMove = function (event, comp) {
            if (this.inProgress) {
                var prevent = false;
                var previousTop = this.top;
                if (comp === null) {
                    // The mouse move event reached the top of the document without hitting a drop component.
                    this.top = null;
                    prevent = true;
                }
                else if (comp['isDropMask']) {
                    // The mouse move event bubbled until it reached a drop mask.
                    this.top = null;
                    prevent = true;
                }
                else if (comp['candidate'](this.type, this.data, this.source)) {
                    // The mouse move event bubbled until it reached a drop component that participates in the current drag operation.
                    this.top = comp;
                    prevent = true;
                }
                if (prevent) {
                    // We prevent the mouse move event from bubbling further up the tree because it reached the foremost drop component and that component is all that matters.
                    event.stopPropagation();
                }
                if (this.top !== previousTop) {
                    this.emit(event.detail.native, 'dragtopchanged', { previousTop: previousTop });
                }
                this.position = {
                    x: event.detail.x,
                    y: event.detail.y
                };
                this.emit(event.detail.native, 'dragpositionchanged');
            }
        };
        DnD.prototype.emit = function (native, event, data) {
            this.eventBus.$emit(event, __assign({ type: this.type, data: this.data, top: this.top, source: this.source, position: this.position, success: this.success, native: native }, data));
        };
        DnD.prototype.on = function (event, callback) {
            this.eventBus.$on(event, callback);
        };
        DnD.prototype.off = function (event, callback) {
            this.eventBus.$off(event, callback);
        };
        return DnD;
    }());
    exports.dnd = new DnD();
    exports.dnd = vuePropertyDecorator.Vue.observable(exports.dnd);

    var DragAwareMixin = /** @class */ (function (_super) {
        __extends(DragAwareMixin, _super);
        function DragAwareMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(DragAwareMixin.prototype, "dragInProgress", {
            get: function () {
                return exports.dnd.inProgress;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragAwareMixin.prototype, "dragData", {
            get: function () {
                return exports.dnd.data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragAwareMixin.prototype, "dragType", {
            get: function () {
                return exports.dnd.type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragAwareMixin.prototype, "dragPosition", {
            get: function () {
                return exports.dnd.position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragAwareMixin.prototype, "dragSource", {
            get: function () {
                return exports.dnd.source;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragAwareMixin.prototype, "dragTop", {
            get: function () {
                return exports.dnd.top;
            },
            enumerable: true,
            configurable: true
        });
        DragAwareMixin = __decorate([
            vuePropertyDecorator.Component({})
        ], DragAwareMixin);
        return DragAwareMixin;
    }(vuePropertyDecorator.Vue));

    /**
     * This files contains the primitives required to create drag images from HTML elements that serve as models. A snapshot
     * of the computed styles of the model elements is taken when creating the drag image, so that it will look the same as
     * the model, no matter where the drag images is grafted into the DOM.
     */
    /**
     * Creates a drag image using the given element as model.
     */
    function createDragImage(el) {
        var clone = deepClone(el);
        clone.style.position = 'fixed';
        clone.style.margin = '0';
        clone.style["z-index"] = '1000';
        clone.style.transition = 'opacity 0.2s';
        return clone;
    }
    /**
     * Clones the given element and all its descendants.
     */
    function deepClone(el) {
        var clone = el.cloneNode(true);
        copyStyle(el, clone);
        var vSrcElements = el.getElementsByTagName("*");
        var vDstElements = clone.getElementsByTagName("*");
        for (var i = vSrcElements.length; i--;) {
            var vSrcElement = vSrcElements[i];
            var vDstElement = vDstElements[i];
            copyStyle(vSrcElement, vDstElement);
        }
        return clone;
    }
    /**
     * Copy the computed styles from src to destination.
     */
    function copyStyle(src, destination) {
        var e_1, _a;
        var computedStyle = window.getComputedStyle(src);
        try {
            for (var computedStyle_1 = __values(computedStyle), computedStyle_1_1 = computedStyle_1.next(); !computedStyle_1_1.done; computedStyle_1_1 = computedStyle_1.next()) {
                var key = computedStyle_1_1.value;
                if (key === 'width') {
                    // IE11
                    var width = computedStyle.getPropertyValue("box-sizing") === 'border-box' ?
                        src.clientWidth :
                        src.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
                    destination.style.setProperty("width", width + "px");
                }
                else if (key === 'height') {
                    // IE11
                    var height = computedStyle.getPropertyValue("box-sizing") === 'border-box' ?
                        src.clientHeight :
                        src.clientHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);
                    destination.style.setProperty("height", height + "px");
                }
                else {
                    destination.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (computedStyle_1_1 && !computedStyle_1_1.done && (_a = computedStyle_1.return)) { _a.call(computedStyle_1); }
            }
            finally { if (e_1) { throw e_1.error; } }
        }
        destination.style.pointerEvents = 'none';
    }

    // Forked from https://gist.github.com/gre/296291b8ce0d8fe6e1c3ea4f1d1c5c3b
    var regex = /(auto|scroll)/;

    var style = function (node, prop) { return getComputedStyle(node, null).getPropertyValue(prop); };

    var scroll = function (node) { return regex.test(
        style(node, "overflow") +
        style(node, "overflow-y") +
        style(node, "overflow-x")); };

    var scrollparent = function (node) { return !node || node===document.body
        ? document.body
        : scroll(node)
          ? node
          : scrollparent(node.parentNode); };

    // Forked from https://github.com/bennadel/JavaScript-Demos/blob/master/demos/window-edge-scrolling/index.htm
    // Code was altered to work with scrollable containers

    var timer = null;

    function cancelScrollAction () {
      clearTimeout(timer);
    }

    function performEdgeScroll(event, container, clientX, clientY, edgeSize) {
      if (!container || !edgeSize) {
        cancelScrollAction();
        return false;
      }
      
      // NOTE: Much of the information here, with regard to document dimensions,
      // viewport dimensions, and window scrolling is derived from JavaScript.info.
      // I am consuming it here primarily as NOTE TO SELF.
      // --
      // Read More: https://javascript.info/size-and-scroll-window
      // --
      // CAUTION: The viewport and document dimensions can all be CACHED and then
      // recalculated on window-resize events (for the most part). I am keeping it
      // all here in the mousemove event handler to remove as many of the moving
      // parts as possible and keep the demo as simple as possible.
      
      // Get the viewport-relative coordinates of the mousemove event.
      var rect = container.getBoundingClientRect();
      var isBody = container === document.body;
      
      var viewportX = clientX - rect.left;
      var viewportY = clientY - rect.top;
      if (isBody) {
        viewportX = clientX;
        viewportY = clientY;
      }
      
      // Get the viewport dimensions.
      var viewportWidth = rect.width;
      var viewportHeight = rect.height;
      if (isBody) {
        viewportWidth = document.documentElement.clientWidth;
        viewportHeight = document.documentElement.clientHeight;
      }
      
      // Next, we need to determine if the mouse is within the "edge" of the
      // viewport, which may require scrolling the window. To do this, we need to
      // calculate the boundaries of the edge in the viewport (these coordinates
      // are relative to the viewport grid system).
      var edgeTop = edgeSize;
      var edgeLeft = edgeSize;
      var edgeBottom = ( viewportHeight - edgeSize );
      var edgeRight = ( viewportWidth - edgeSize );
      
      var isInLeftEdge = ( viewportX < edgeLeft );
      var isInRightEdge = ( viewportX > edgeRight );
      var isInTopEdge = ( viewportY < edgeTop );
      var isInBottomEdge = ( viewportY > edgeBottom );
      
      // If the mouse is not in the viewport edge, there's no need to calculate
      // anything else.
      if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
        cancelScrollAction();
        return false;
      }
      
      // If we made it this far, the user's mouse is located within the edge of the
      // viewport. As such, we need to check to see if scrolling needs to be done.
      
      // Get the document dimensions.
      var documentWidth = Math.max(
        container.scrollWidth,
        container.offsetWidth,
        container.clientWidth
      );
      var documentHeight = Math.max(
        container.scrollHeight,
        container.offsetHeight,
        container.clientHeight
      );
      
      // Calculate the maximum scroll offset in each direction. Since you can only
      // scroll the overflow portion of the document, the maximum represents the
      // length of the document that is NOT in the viewport.
      var maxScrollX = (documentWidth - viewportWidth);
      var maxScrollY = (documentHeight - viewportHeight);
      
      // As we examine the mousemove event, we want to adjust the window scroll in
      // immediate response to the event; but, we also want to continue adjusting
      // the window scroll if the user rests their mouse in the edge boundary. To
      // do this, we'll invoke the adjustment logic immediately. Then, we'll setup
      // a timer that continues to invoke the adjustment logic while the window can
      // still be scrolled in a particular direction.
      // --
      // NOTE: There are probably better ways to handle the ongoing animation
      // check. But, the point of this demo is really about the math logic, not so
      // much about the interval logic.
      (function checkForWindowScroll() {
        cancelScrollAction();
        
        if (adjustWindowScroll()) {
          timer = setTimeout( checkForWindowScroll, 30 );
        }
      })();
      
      // Adjust the window scroll based on the user's mouse position. Returns True
      // or False depending on whether or not the window scroll was changed.
      function adjustWindowScroll() {
        // Get the current scroll position of the document.
        var currentScrollX = container.scrollLeft;
        var currentScrollY = container.scrollTop;
        if (isBody) {
          currentScrollX = window.pageXOffset;
          currentScrollY = window.pageYOffset;
        }
        
        // Determine if the window can be scrolled in any particular direction.
        var canScrollUp = (currentScrollY > 0);
        var canScrollDown = (currentScrollY < maxScrollY);
        var canScrollLeft = (currentScrollX > 0);
        var canScrollRight = (currentScrollX < maxScrollX);
        
        // Since we can potentially scroll in two directions at the same time,
        // let's keep track of the next scroll, starting with the current scroll.
        // Each of these values can then be adjusted independently in the logic
        // below.
        var nextScrollX = currentScrollX;
        var nextScrollY = currentScrollY;
        
        // As we examine the mouse position within the edge, we want to make the
        // incremental scroll changes more "intense" the closer that the user
        // gets the viewport edge. As such, we'll calculate the percentage that
        // the user has made it "through the edge" when calculating the delta.
        // Then, that use that percentage to back-off from the "max" step value.
        var maxStep = 50;
        
        // Should we scroll left?
        if (isInLeftEdge && canScrollLeft) {
          var intensity = ((edgeLeft - viewportX) / edgeSize);
          nextScrollX = (nextScrollX - (maxStep * intensity));
        }
        // Should we scroll right?
        else if (isInRightEdge && canScrollRight) {
          var intensity = ((viewportX - edgeRight) / edgeSize);
          nextScrollX = (nextScrollX + (maxStep * intensity));
        }
        
        // Should we scroll up?
        if (isInTopEdge && canScrollUp) {
          var intensity = ((edgeTop - viewportY) / edgeSize);
          nextScrollY = (nextScrollY - (maxStep * intensity));
        }
        // Should we scroll down?
        else if (isInBottomEdge && canScrollDown) {
          var intensity = ((viewportY - edgeBottom) / edgeSize);
          nextScrollY = (nextScrollY + (maxStep * intensity));
        }
        
        // Sanitize invalid maximums. An invalid scroll offset won't break the
        // subsequent .scrollTo() call; however, it will make it harder to
        // determine if the .scrollTo() method should have been called in the
        // first place.
        nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
        nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));
        
        if (
          (nextScrollX !== currentScrollX) ||
          (nextScrollY !== currentScrollY)
        ) {
          (isBody ? window : container).scrollTo(nextScrollX, nextScrollY);
          return true;
        }
        else {
          return false;
        }
      }
      
      return true
    }

    var DragMixin = /** @class */ (function (_super) {
        __extends(DragMixin, _super);
        function DragMixin() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isDrag = true;
            _this.mouseIn = null;
            return _this;
        }
        DragMixin.prototype.created = function () {
            this.reEmit("dragstart");
            this.reEmit("dragend");
        };
        DragMixin.prototype.reEmit = function (eventName) {
            var _this = this;
            exports.dnd.on(eventName, function (ev) {
                if (ev.source === _this) {
                    _this.$emit(eventName, ev);
                }
            });
        };
        DragMixin.prototype.mounted = function () {
            var comp = this;
            var el = this.$el;
            var dragStarted = false;
            var ignoreNextClick = false;
            var initialUserSelect;
            var downEvent = null;
            var startPosition = null;
            var delayTimer = null;
            var scrollContainer = null;
            var hasPassedDelay = true;
            el.addEventListener('mousedown', onMouseDown);
            el.addEventListener('touchstart', onMouseDown);
            el.addEventListener('mouseenter', onMouseEnter);
            el.addEventListener('mouseleave', onMouseLeave);
            function onMouseEnter() {
                comp.mouseIn = true;
            }
            function onMouseLeave() {
                comp.mouseIn = false;
            }
            function noop(e) {
                e.stopPropagation();
                e.preventDefault();
            }
            function performVibration() {
                // If browser can perform vibration and user has defined a vibration, perform it
                if (comp.vibration > 0 && window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(comp.vibration);
                }
            }
            function onMouseDown(e) {
                var target;
                var goodButton;
                if (e.type === 'mousedown') {
                    var mouse = e;
                    target = e.target;
                    goodButton = mouse.buttons === 1;
                }
                else {
                    var touch = e;
                    target = touch.touches[0].target;
                    goodButton = true;
                }
                var goodTarget = !comp.handle || target.matches(comp.handle + ', ' + comp.handle + ' *');
                if (!comp.disabled && downEvent === null && goodButton && goodTarget) {
                    scrollContainer = scrollparent(target);
                    initialUserSelect = document.body.style.userSelect;
                    document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
                    // quand on quitte un élémént avec overflow: hidden.
                    dragStarted = false;
                    downEvent = e;
                    if (downEvent.type === 'mousedown') {
                        var mouse = event;
                        startPosition = {
                            x: mouse.clientX,
                            y: mouse.clientY
                        };
                    }
                    else {
                        var touch = event;
                        startPosition = {
                            x: touch.touches[0].clientX,
                            y: touch.touches[0].clientY
                        };
                    }
                    if (!!comp.delay) {
                        hasPassedDelay = false;
                        clearTimeout(delayTimer);
                        delayTimer = setTimeout(function () {
                            hasPassedDelay = true;
                            performVibration();
                        }, comp.delay);
                    }
                    else {
                        performVibration();
                    }
                    document.addEventListener('click', onMouseClick, true);
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('touchmove', onMouseMove, { passive: false });
                    document.addEventListener('easy-dnd-move', onEasyDnDMove);
                    document.addEventListener('mouseup', onMouseUp);
                    document.addEventListener('touchend', onMouseUp);
                    document.addEventListener('selectstart', noop);
                    document.addEventListener('keyup', onKeyUp);
                    // Prevents event from bubbling to ancestor drag components and initiate several drags at the same time
                    e.stopPropagation();
                    // Prevents touchstart event to be converted to mousedown
                    //e.preventDefault();
                }
            }
            // Prevent the user from accidentally causing a click event
            // if they have just attempted a drag event
            function onMouseClick(e) {
                if (ignoreNextClick) {
                    e.preventDefault();
                    e.stopPropagation && e.stopPropagation();
                    e.stopImmediatePropagation && e.stopImmediatePropagation();
                    ignoreNextClick = false;
                    return false;
                }
            }
            function onMouseMove(e) {
                // We ignore the mousemove event that follows touchend :
                if (downEvent === null)
                    { return; }
                // On touch devices, we ignore fake mouse events and deal with touch events only.
                if (downEvent.type === 'touchstart' && e.type === 'mousemove')
                    { return; }
                // Find out event target and pointer position :
                var target;
                var x;
                var y;
                if (e.type === 'touchmove') {
                    var touch = e;
                    x = touch.touches[0].clientX;
                    y = touch.touches[0].clientY;
                    target = document.elementFromPoint(x, y);
                    if (!target) {
                        // Mouse going off screen. Ignore event.
                        return;
                    }
                }
                else {
                    var mouse = e;
                    x = mouse.clientX;
                    y = mouse.clientY;
                    target = mouse.target;
                }
                // Distance between current event and start position :
                var dist = Math.sqrt(Math.pow(startPosition.x - x, 2) + Math.pow(startPosition.y - y, 2));
                // If the drag has not begun yet and distance from initial point is greater than delta, we start the drag :
                if (!dragStarted && dist > comp.delta) {
                    // If they have dragged greater than the delta before the delay period has ended,
                    // It means that they attempted to perform another action (such as scrolling) on the page
                    if (!hasPassedDelay) {
                        clearTimeout(delayTimer);
                    }
                    else {
                        ignoreNextClick = true;
                        dragStarted = true;
                        exports.dnd.startDrag(comp, downEvent, startPosition.x, startPosition.y, comp.type, comp.data);
                        document.documentElement.classList.add('drag-in-progress');
                    }
                }
                // Dispatch custom easy-dnd-move event :
                if (dragStarted) {
                    // If cursor/touch is at edge of container, perform scroll if available
                    // If comp.dragTop is defined, it means they are dragging on top of another DropList/EasyDnd component
                    // if dropTop is a DropList, use the scrollingEdgeSize of that container if it exists, otherwise use the scrollingEdgeSize of the Drag component
                    var currEdgeSize = comp.dragTop && comp.dragTop.$props.scrollingEdgeSize !== undefined ?
                        comp.dragTop.$props.scrollingEdgeSize :
                        comp.scrollingEdgeSize;
                    if (!!currEdgeSize) {
                        var currScrollContainer = comp.dragTop ? scrollparent(comp.dragTop.$el) : scrollContainer;
                        performEdgeScroll(e, currScrollContainer, x, y, currEdgeSize);
                    }
                    else {
                        cancelScrollAction();
                    }
                    var custom = new CustomEvent("easy-dnd-move", {
                        bubbles: true,
                        cancelable: true,
                        detail: {
                            x: x,
                            y: y,
                            native: e
                        }
                    });
                    target.dispatchEvent(custom);
                }
                // Prevent scroll on touch devices if they were performing a drag
                if (hasPassedDelay && e.cancelable) {
                    e.preventDefault();
                }
            }
            function onEasyDnDMove(e) {
                exports.dnd.mouseMove(e, null);
            }
            function onMouseUp(e) {
                cancelDragActions();
                // On touch devices, we ignore fake mouse events and deal with touch events only.
                if (downEvent.type === 'touchstart' && e.type === 'mouseup')
                    { return; }
                // This delay makes sure that when the click event that results from the mouseup is produced, the drag is
                // still in progress. So by checking the flag dnd.inProgress, one can tell apart true clicks from drag and
                // drop artefacts.
                setTimeout(function () {
                    if (dragStarted) {
                        exports.dnd.stopDrag(e);
                    }
                    finishDrag();
                }, 0);
            }
            function onKeyUp(e) {
                // If ESC is pressed, cancel the drag
                if (e.key === 'Escape') {
                    cancelDragActions();
                    setTimeout(function () {
                        exports.dnd.cancelDrag(e);
                        finishDrag();
                    }, 0);
                }
            }
            function cancelDragActions() {
                hasPassedDelay = true;
                clearTimeout(delayTimer);
                cancelScrollAction();
            }
            function finishDrag() {
                downEvent = null;
                scrollContainer = null;
                if (dragStarted) {
                    document.documentElement.classList.remove('drag-in-progress');
                }
                document.removeEventListener('click', onMouseClick, true);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('easy-dnd-move', onEasyDnDMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('touchend', onMouseUp);
                document.removeEventListener('selectstart', noop);
                document.removeEventListener('keyup', onKeyUp);
                document.documentElement.style.userSelect = initialUserSelect;
            }
        };
        Object.defineProperty(DragMixin.prototype, "dragIn", {
            get: function () {
                return !this.dragInProgress && this.mouseIn;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragMixin.prototype, "cssClasses", {
            get: function () {
                var clazz = {
                    'dnd-drag': true
                };
                if (!this.disabled) {
                    return __assign(__assign({}, clazz), { 'drag-source': this.dragInProgress && this.dragSource === this, 'drag-in': this.dragIn, 'drag-out': !this.dragIn, 'drag-mode-copy': this.currentDropMode === 'copy', 'drag-mode-cut': this.currentDropMode === 'cut', 'drag-mode-reordering': this.currentDropMode === 'reordering', 'drag-no-handle': !this.handle });
                }
                else {
                    return __assign({}, clazz);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragMixin.prototype, "currentDropMode", {
            get: function () {
                if (this.dragInProgress && this.dragSource === this) {
                    if (this.dragTop && this.dragTop['dropAllowed']) {
                        if (this.dragTop['reordering'])
                            { return 'reordering'; }
                        else
                            { return this.dragTop['mode']; }
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        DragMixin.prototype.createDragImage = function (selfTransform) {
            var image;
            if (this.$scopedSlots['drag-image']) {
                var el = this.$refs['drag-image'];
                if (el.childElementCount !== 1) {
                    image = createDragImage(el);
                }
                else {
                    image = createDragImage(el.children.item(0));
                }
            }
            else {
                image = createDragImage(this.$el);
                image.style.transform = selfTransform;
            }
            if (this.dragClass) {
                image.classList.add(this.dragClass);
            }
            image.classList.add('dnd-ghost');
            image['__opacity'] = this.dragImageOpacity;
            return image;
        };
        __decorate([
            vuePropertyDecorator.Prop({ default: null, type: null }),
            __metadata("design:type", String)
        ], DragMixin.prototype, "type", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: null, type: null }),
            __metadata("design:type", Object)
        ], DragMixin.prototype, "data", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: 0.7, type: Number }),
            __metadata("design:type", Object)
        ], DragMixin.prototype, "dragImageOpacity", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: false, type: Boolean }),
            __metadata("design:type", Boolean)
        ], DragMixin.prototype, "disabled", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: false, type: Boolean }),
            __metadata("design:type", Boolean)
        ], DragMixin.prototype, "goBack", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ required: false, type: String }),
            __metadata("design:type", String)
        ], DragMixin.prototype, "handle", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ type: Number, default: 3 }),
            __metadata("design:type", Number)
        ], DragMixin.prototype, "delta", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ type: Number, default: 0 }),
            __metadata("design:type", Number)
        ], DragMixin.prototype, "delay", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ type: String, default: null }),
            __metadata("design:type", String)
        ], DragMixin.prototype, "dragClass", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ type: Number, default: 0 }),
            __metadata("design:type", Number)
        ], DragMixin.prototype, "vibration", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ type: Number, default: 100 }),
            __metadata("design:type", Number)
        ], DragMixin.prototype, "scrollingEdgeSize", void 0);
        DragMixin = __decorate([
            vuePropertyDecorator.Component({})
        ], DragMixin);
        return DragMixin;
    }(DragAwareMixin));

    var Drag = /** @class */ (function (_super) {
        __extends(Drag, _super);
        function Drag() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        __decorate([
            vuePropertyDecorator.Prop({ default: 'div', type: [String, Object, Function] }),
            __metadata("design:type", Object)
        ], Drag.prototype, "tag", void 0);
        Drag = __decorate([
            vuePropertyDecorator.Component({})
        ], Drag);
        return Drag;
    }(DragMixin));

    function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
    /* server only */
    , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
      } // Vue.extend constructor export interop.


      var options = typeof script === 'function' ? script.options : script; // render functions

      if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true; // functional template

        if (isFunctionalTemplate) {
          options.functional = true;
        }
      } // scopedId


      if (scopeId) {
        options._scopeId = scopeId;
      }

      var hook;

      if (moduleIdentifier) {
        // server build
        hook = function hook(context) {
          // 2.3 injection
          context = context || // cached call
          this.$vnode && this.$vnode.ssrContext || // stateful
          this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
          // 2.2 with runInNewContext: true

          if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
            context = __VUE_SSR_CONTEXT__;
          } // inject component styles


          if (style) {
            style.call(this, createInjectorSSR(context));
          } // register component module identifier for async chunk inference


          if (context && context._registeredComponents) {
            context._registeredComponents.add(moduleIdentifier);
          }
        }; // used by ssr in case component is cached and beforeCreate
        // never gets called


        options._ssrRegister = hook;
      } else if (style) {
        hook = shadowMode ? function () {
          style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
        } : function (context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook) {
        if (options.functional) {
          // register for functional component in vue file
          var originalRender = options.render;

          options.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context);
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = options.beforeCreate;
          options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }

      return script;
    }

    var normalizeComponent_1 = normalizeComponent;

    var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
    function createInjector(context) {
      return function (id, style) {
        return addStyle(id, style);
      };
    }
    var HEAD;
    var styles = {};

    function addStyle(id, css) {
      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = {
        ids: new Set(),
        styles: []
      });

      if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;

        if (css.map) {
          // https://developer.chrome.com/devtools/docs/javascript-debugging
          // this makes source maps inside style tags work properly in Chrome
          code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

          code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
        }

        if (!style.element) {
          style.element = document.createElement('style');
          style.element.type = 'text/css';
          if (css.media) { style.element.setAttribute('media', css.media); }

          if (HEAD === undefined) {
            HEAD = document.head || document.getElementsByTagName('head')[0];
          }

          HEAD.appendChild(style.element);
        }

        if ('styleSheet' in style.element) {
          style.styles.push(code);
          style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
        } else {
          var index = style.ids.size - 1;
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }else { style.element.appendChild(textNode); }
        }
      }
    }

    var browser = createInjector;

    /* script */
    var __vue_script__ = Drag;

    /* template */
    var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.cssClasses,scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),_c('div',{ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image")],2)],2)};
    var __vue_staticRenderFns__ = [];

      /* style */
      var __vue_inject_styles__ = function (inject) {
        if (!inject) { return }
        inject("data-v-1e7ee26e_0", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}.drag-no-handle.drag-in{cursor:move;cursor:grab}", map: undefined, media: undefined })
    ,inject("data-v-1e7ee26e_1", { source: "html.drag-in-progress *{cursor:move!important;cursor:grabbing!important}", map: undefined, media: undefined })
    ,inject("data-v-1e7ee26e_2", { source: ".__drag-image[data-v-1e7ee26e]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__ = "data-v-1e7ee26e";
      /* module identifier */
      var __vue_module_identifier__ = undefined;
      /* functional template */
      var __vue_is_functional_template__ = false;
      /* style inject SSR */
      

      
      var Drag$1 = normalizeComponent_1(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        browser,
        undefined
      );

    var DropMixin = /** @class */ (function (_super) {
        __extends(DropMixin, _super);
        function DropMixin() {
            var _this = _super.call(this) || this;
            _this.isDrop = true;
            return _this;
        }
        DropMixin.prototype.effectiveAcceptsType = function (type) {
            if (this.acceptsType === null)
                { return true; }
            else if (typeof (this.acceptsType) === 'string')
                { return this.acceptsType === type; }
            else if (typeof (this.acceptsType) === 'object' && Array.isArray(this.acceptsType)) {
                return this.acceptsType.includes(type);
            }
            else {
                return this.acceptsType(type);
            }
        };
        DropMixin.prototype.effectiveAcceptsData = function (data, type) {
            return this.acceptsData(data, type);
        };
        DropMixin.prototype.created = function () {
            exports.dnd.on("dragpositionchanged", this.onDragPositionChanged);
            exports.dnd.on("dragtopchanged", this.onDragTopChanged);
            exports.dnd.on("drop", this.onDrop);
        };
        DropMixin.prototype.destroyed = function () {
            exports.dnd.off("dragpositionchanged", this.onDragPositionChanged);
            exports.dnd.off("dragtopchanged", this.onDragTopChanged);
            exports.dnd.off("drop", this.onDrop);
        };
        DropMixin.prototype.onDragPositionChanged = function (event) {
            if (this === event.top) {
                this.$emit("dragover", event);
            }
        };
        DropMixin.prototype.onDragTopChanged = function (event) {
            if (this === event.top) {
                this.$emit("dragenter", event);
            }
            if (this === event.previousTop) {
                this.$emit("dragleave", event);
            }
        };
        DropMixin.prototype.onDrop = function (event) {
            if (this.dropIn && this.compatibleMode && this.dropAllowed) {
                this.doDrop(event);
            }
        };
        DropMixin.prototype.doDrop = function (event) {
            this.$emit('drop', event);
            event.source.$emit(this.mode, event);
        };
        DropMixin.prototype.mounted = function () {
            var el = this.$el;
            var comp = this;
            el.addEventListener('easy-dnd-move', onMouseMove);
            function onMouseMove(e) {
                exports.dnd.mouseMove(e, comp);
            }
        };
        Object.defineProperty(DropMixin.prototype, "compatibleMode", {
            get: function () {
                if (this.dragInProgress) {
                    return this.mode === 'copy' || exports.dnd.sourceListeners.hasOwnProperty(this.mode);
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropMixin.prototype, "dropIn", {
            get: function () {
                if (this.dragInProgress) {
                    return this.dragTop === this;
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropMixin.prototype, "typeAllowed", {
            get: function () {
                if (this.dragInProgress) {
                    return this.effectiveAcceptsType(this.dragType);
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropMixin.prototype, "dropAllowed", {
            get: function () {
                if (this.dragInProgress) {
                    if (this.typeAllowed) {
                        return this.compatibleMode && this.effectiveAcceptsData(this.dragData, this.dragType);
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropMixin.prototype, "cssClasses", {
            get: function () {
                var clazz = {
                    'dnd-drop': true
                };
                if (this.dropIn !== null) {
                    clazz = __assign(__assign({}, clazz), { "drop-in": this.dropIn, "drop-out": !this.dropIn });
                }
                if (this.typeAllowed !== null) {
                    clazz = __assign(__assign({}, clazz), { "type-allowed": this.typeAllowed, "type-forbidden": !this.typeAllowed });
                }
                if (this.dropAllowed !== null) {
                    clazz = __assign(__assign({}, clazz), { "drop-allowed": this.dropAllowed, "drop-forbidden": !this.dropAllowed });
                }
                return clazz;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropMixin.prototype, "cssStyle", {
            get: function () {
                return {};
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Returns true if the current drop area participates in the current drag operation.
         */
        DropMixin.prototype.candidate = function (type, data, source) {
            return this.effectiveAcceptsType(type);
        };
        DropMixin.prototype.createDragImage = function () {
            var image;
            if (this.$refs['drag-image']) {
                var el = this.$refs['drag-image'];
                if (el.childElementCount !== 1) {
                    image = createDragImage(el);
                }
                else {
                    image = createDragImage(el.children.item(0));
                }
                image['__opacity'] = this.dragImageOpacity;
                image.classList.add('dnd-ghost');
            }
            else {
                image = 'source';
            }
            return image;
        };
        __decorate([
            vuePropertyDecorator.Prop({ default: function () { return function () { return true; }; }, type: [String, Array, Function] }),
            __metadata("design:type", Object)
        ], DropMixin.prototype, "acceptsType", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: function () { return true; }, type: Function }),
            __metadata("design:type", Object)
        ], DropMixin.prototype, "acceptsData", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: 'copy' }),
            __metadata("design:type", String)
        ], DropMixin.prototype, "mode", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: 0.7, type: Number }),
            __metadata("design:type", Object)
        ], DropMixin.prototype, "dragImageOpacity", void 0);
        DropMixin = __decorate([
            vuePropertyDecorator.Component({}),
            __metadata("design:paramtypes", [])
        ], DropMixin);
        return DropMixin;
    }(DragAwareMixin));

    var Drop = /** @class */ (function (_super) {
        __extends(Drop, _super);
        function Drop() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Drop.prototype, "showDragImage", {
            get: function () {
                return this.dragInProgress && this.typeAllowed && this.$scopedSlots['drag-image'];
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            vuePropertyDecorator.Prop({ default: 'div', type: [String, Object, Function] }),
            __metadata("design:type", Object)
        ], Drop.prototype, "tag", void 0);
        Drop = __decorate([
            vuePropertyDecorator.Component({})
        ], Drop);
        return Drop;
    }(DropMixin));

    /* script */
    var __vue_script__$1 = Drop;

    /* template */
    var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.cssClasses,style:(_vm.cssStyle),scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),(_vm.showDragImage)?_c('div',{ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e()],2)};
    var __vue_staticRenderFns__$1 = [];

      /* style */
      var __vue_inject_styles__$1 = function (inject) {
        if (!inject) { return }
        inject("data-v-36a3fb0c_0", { source: ".drop-allowed.drop-in,.drop-allowed.drop-in *{cursor:pointer!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined })
    ,inject("data-v-36a3fb0c_1", { source: ".__drag-image[data-v-36a3fb0c]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__$1 = "data-v-36a3fb0c";
      /* module identifier */
      var __vue_module_identifier__$1 = undefined;
      /* functional template */
      var __vue_is_functional_template__$1 = false;
      /* style inject SSR */
      

      
      var Drop$1 = normalizeComponent_1(
        { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
        __vue_inject_styles__$1,
        __vue_script__$1,
        __vue_scope_id__$1,
        __vue_is_functional_template__$1,
        __vue_module_identifier__$1,
        browser,
        undefined
      );

    var DropMask = /** @class */ (function (_super) {
        __extends(DropMask, _super);
        function DropMask() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isDropMask = true;
            return _this;
        }
        DropMask.prototype.mounted = function () {
            var el = this.$el;
            var comp = this;
            el.addEventListener('easy-dnd-move', onMouseMove);
            function onMouseMove(e) {
                exports.dnd.mouseMove(e, comp);
            }
        };
        DropMask.prototype.createDragImage = function () {
            return 'source';
        };
        __decorate([
            vuePropertyDecorator.Prop({ default: 'div', type: [String, Object, Function] }),
            __metadata("design:type", Object)
        ], DropMask.prototype, "tag", void 0);
        DropMask = __decorate([
            vuePropertyDecorator.Component({})
        ], DropMask);
        return DropMask;
    }(DragAwareMixin));

    /* script */
    var __vue_script__$2 = DropMask;

    /* template */
    var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default")],2)};
    var __vue_staticRenderFns__$2 = [];

      /* style */
      var __vue_inject_styles__$2 = undefined;
      /* scoped */
      var __vue_scope_id__$2 = undefined;
      /* module identifier */
      var __vue_module_identifier__$2 = undefined;
      /* functional template */
      var __vue_is_functional_template__$2 = false;
      /* style inject */
      
      /* style inject SSR */
      

      
      var DropMask$1 = normalizeComponent_1(
        { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
        __vue_inject_styles__$2,
        __vue_script__$2,
        __vue_scope_id__$2,
        __vue_is_functional_template__$2,
        __vue_module_identifier__$2,
        undefined,
        undefined
      );

    /**
     * This class reacts to drag events emitted by the dnd object to manage a sequence of drag images and fade from one to the
     * other as the drag progresses.
     */
    var DragImagesManager = /** @class */ (function (_super) {
        __extends(DragImagesManager, _super);
        function DragImagesManager() {
            var _this = _super.call(this) || this;
            _this.selfTransform = null;
            _this.clones = null;
            _this.source = null;
            _this.sourcePos = null;
            _this.sourceClone = null;
            exports.dnd.on('dragstart', _this.onDragStart);
            exports.dnd.on('dragtopchanged', _this.onDragTopChanged);
            exports.dnd.on('dragpositionchanged', _this.onDragPositionChanged);
            exports.dnd.on('dragend', _this.onDragEnd);
            return _this;
        }
        DragImagesManager.prototype.onDragStart = function (event) {
            this.sourcePos = {
                x: event.source.$el.getBoundingClientRect().left,
                y: event.source.$el.getBoundingClientRect().top
            };
            this.selfTransform = "translate(-" + (event.position.x - this.sourcePos.x) + "px, -" + (event.position.y - this.sourcePos.y) + "px)";
            this.clones = new Map();
            this.source = event.source;
        };
        DragImagesManager.prototype.onDragEnd = function (event) {
            var _this = this;
            vuePropertyDecorator.Vue.nextTick(function () {
                if (!event.success && _this.source && _this.source['goBack']) {
                    // Restore the drag image that is active when hovering outside any drop zone :
                    var img_1 = _this.switch(null);
                    // Move it back to its original place :
                    window.requestAnimationFrame(function () {
                        img_1.style.transition = "all 0.5s";
                        window.requestAnimationFrame(function () {
                            img_1.style.left = _this.sourcePos.x + "px";
                            img_1.style.top = _this.sourcePos.y + "px";
                            img_1.style.transform = "translate(0,0)";
                            var handler = function () {
                                _this.cleanUp();
                                img_1.removeEventListener("transitionend", handler);
                            };
                            img_1.addEventListener("transitionend", handler);
                        });
                    });
                }
                else {
                    _this.cleanUp();
                }
            });
        };
        DragImagesManager.prototype.cleanUp = function () {
            if (this.clones) {
                this.clones.forEach(function (clone) {
                    if (clone.parentNode === document.body) {
                        document.body.removeChild(clone);
                    }
                });
            }
            if (this.sourceClone !== null) {
                if (this.sourceClone.parentNode === document.body) {
                    document.body.removeChild(this.sourceClone);
                }
            }
            this.selfTransform = null;
            this.clones = null;
            this.source = null;
            this.sourceClone = null;
            this.sourcePos = null;
        };
        DragImagesManager.prototype.onDragTopChanged = function (event) {
            this.switch(event.top);
        };
        DragImagesManager.prototype.switch = function (top) {
            this.clones.forEach(function (clone) {
                clone.style.opacity = "0";
            });
            if (this.sourceClone) {
                this.sourceClone.style.opacity = "0";
            }
            var activeClone;
            if (top === null) {
                activeClone = this.getSourceClone();
            }
            else {
                if (!this.clones.has(top)) {
                    var clone = top['createDragImage'](this.selfTransform);
                    if (clone === 'source') {
                        clone = this.getSourceClone();
                    }
                    else if (clone !== null) {
                        clone.style.opacity = '0';
                        document.body.appendChild(clone);
                    }
                    this.clones.set(top, clone);
                }
                activeClone = this.clones.get(top);
            }
            if (activeClone !== null) {
                activeClone.offsetWidth; // Forces broswer reflow
                activeClone.style.opacity = activeClone['__opacity'];
                activeClone.style.visibility = 'visible';
            }
            return activeClone;
        };
        DragImagesManager.prototype.getSourceClone = function () {
            if (this.sourceClone === null) {
                this.sourceClone = this.source['createDragImage'](this.selfTransform);
                this.sourceClone.style.opacity = '0';
                document.body.appendChild(this.sourceClone);
            }
            return this.sourceClone;
        };
        DragImagesManager.prototype.onDragPositionChanged = function (event) {
            this.clones.forEach(function (clone) {
                clone.style.left = exports.dnd.position.x + "px";
                clone.style.top = exports.dnd.position.y + "px";
            });
            if (this.sourceClone) {
                this.sourceClone.style.left = exports.dnd.position.x + "px";
                this.sourceClone.style.top = exports.dnd.position.y + "px";
            }
        };
        DragImagesManager = __decorate([
            vuePropertyDecorator.Component({}) // Necessary to set proper "this" context in event listeners.
            ,
            __metadata("design:paramtypes", [])
        ], DragImagesManager);
        return DragImagesManager;
    }(vuePropertyDecorator.Vue));
    new DragImagesManager();

    var DragFeedback = /** @class */ (function (_super) {
        __extends(DragFeedback, _super);
        function DragFeedback() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DragFeedback = __decorate([
            vuePropertyDecorator.Component({})
        ], DragFeedback);
        return DragFeedback;
    }(vuePropertyDecorator.Vue));

    /* script */
    var __vue_script__$3 = DragFeedback;

    /* template */
    var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"DragFeedback"},[_vm._t("default")],2)};
    var __vue_staticRenderFns__$3 = [];

      /* style */
      var __vue_inject_styles__$3 = undefined;
      /* scoped */
      var __vue_scope_id__$3 = "data-v-0589f3cb";
      /* module identifier */
      var __vue_module_identifier__$3 = undefined;
      /* functional template */
      var __vue_is_functional_template__$3 = false;
      /* style inject */
      
      /* style inject SSR */
      

      
      var DragFeedback$1 = normalizeComponent_1(
        { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
        __vue_inject_styles__$3,
        __vue_script__$3,
        __vue_scope_id__$3,
        __vue_is_functional_template__$3,
        __vue_module_identifier__$3,
        undefined,
        undefined
      );

    var Grid = /** @class */ (function () {
        function Grid(collection, upToIndex, row, fromIndex) {
            var e_1, _a;
            this.magnets = [];
            this.reference = collection.item(0).parentNode;
            this.referenceOriginalPosition = {
                x: this.reference.getBoundingClientRect().left - this.reference.scrollLeft,
                y: this.reference.getBoundingClientRect().top - this.reference.scrollTop,
            };
            var index = 0;
            try {
                for (var collection_1 = __values(collection), collection_1_1 = collection_1.next(); !collection_1_1.done; collection_1_1 = collection_1.next()) {
                    var child = collection_1_1.value;
                    if (index > upToIndex)
                        { break; }
                    var rect = child.getBoundingClientRect();
                    var hasNestedDrop = child.classList.contains("dnd-drop") || child.getElementsByClassName("dnd-drop").length > 0;
                    var horizontal = null;
                    if (hasNestedDrop) {
                        if (row === 'auto') {
                            // Auto mode not supported for now. Row or column must be defined explicitly if there are nested drop lists.
                            throw new Error("Easy-DnD error : a drop list is missing one of these attributes : 'row' or 'column'.");
                        }
                        else {
                            horizontal = row === 'row';
                        }
                    }
                    if (fromIndex === null) {
                        // Inserting mode.
                        this.magnets.push(hasNestedDrop ? this.before(rect, horizontal) : this.center(rect));
                    }
                    else {
                        // Reordering mode.
                        this.magnets.push(hasNestedDrop ? (fromIndex < index ? this.after : this.before)(rect, horizontal) : this.center(rect));
                    }
                    // Debug : show magnets :
                    //document.body.insertAdjacentHTML("beforeend", "<div style='background-color: red; position: fixed; width: 1px; height: 1px; top:" + this.magnets[index].y + "px; left:" + this.magnets[index].x + "px;' ></div>")
                    index++;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (collection_1_1 && !collection_1_1.done && (_a = collection_1.return)) { _a.call(collection_1); }
                }
                finally { if (e_1) { throw e_1.error; } }
            }
        }
        /**
         * Returns the center of the rectangle.
         */
        Grid.prototype.center = function (rect) {
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        };
        /**
         * When horizontal is true / false, returns middle of the left / top side of the rectangle.
         */
        Grid.prototype.before = function (rect, horizontal) {
            return horizontal ? {
                x: rect.left,
                y: rect.top + rect.height / 2
            } : {
                x: rect.left + rect.width / 2,
                y: rect.top
            };
        };
        /**
         * When horizontal is true / false, returns middle of the right / bottom side of the rectangle.
         */
        Grid.prototype.after = function (rect, horizontal) {
            return horizontal ? {
                x: rect.left + rect.width,
                y: rect.top + rect.height / 2
            } : {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height
            };
        };
        /**
         * In case the user scrolls during the drag, the position of the magnets are not what they used to be when the drag
         * started. A correction must be applied that takes into account the amount of scroll. This correction is the
         * difference between the current position of the parent element and its position when the drag started.
         */
        Grid.prototype.correction = function () {
            return {
                x: this.reference.getBoundingClientRect().left - this.reference.scrollLeft - this.referenceOriginalPosition.x,
                y: this.reference.getBoundingClientRect().top - this.reference.scrollTop - this.referenceOriginalPosition.y,
            };
        };
        Grid.prototype.closestIndex = function (position) {
            var x = position.x - this.correction().x;
            var y = position.y - this.correction().y;
            var minDist = 999999;
            var index = -1;
            for (var i = 0; i < this.magnets.length; i++) {
                var magnet = this.magnets[i];
                var dist = Math.sqrt(Math.pow(magnet.x - x, 2) + Math.pow(magnet.y - y, 2));
                if (dist < minDist) {
                    minDist = dist;
                    index = i;
                }
            }
            return index;
        };
        return Grid;
    }());

    var DnDEvent = /** @class */ (function () {
        function DnDEvent() {
        }
        return DnDEvent;
    }());
    var ReorderEvent = /** @class */ (function () {
        function ReorderEvent(from, to) {
            this.from = from;
            this.to = to;
        }
        ReorderEvent.prototype.apply = function (array) {
            var tmp = array[this.from];
            array.splice(this.from, 1);
            array.splice(this.to, 0, tmp);
        };
        return ReorderEvent;
    }());
    var InsertEvent = /** @class */ (function () {
        function InsertEvent(type, data, index) {
            this.type = type;
            this.data = data;
            this.index = index;
        }
        return InsertEvent;
    }());

    var DropList = /** @class */ (function (_super) {
        __extends(DropList, _super);
        function DropList() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.grid = null;
            _this.forbiddenKeys = [];
            _this.feedbackKey = null;
            _this.fromIndex = null;
            return _this;
        }
        Object.defineProperty(DropList.prototype, "rootTag", {
            get: function () {
                if (this.noAnimations) {
                    return this.tag ? this.tag : 'div';
                }
                else {
                    return "transition-group";
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "rootProps", {
            get: function () {
                if (this.noAnimations) {
                    return this.$attrs;
                }
                else {
                    return {
                        tag: this.tag,
                        duration: { enter: 0, leave: 0 },
                        css: false
                    };
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "rootListeners", {
            get: function () {
                if (this.noAnimations) {
                    return this.$listeners;
                }
                else {
                    return {};
                }
            },
            enumerable: true,
            configurable: true
        });
        DropList.prototype.created = function () {
            exports.dnd.on("dragstart", this.onDragStart);
            exports.dnd.on("dragend", this.onDragEnd);
        };
        Object.defineProperty(DropList.prototype, "direction", {
            get: function () {
                if (this.row)
                    { return 'row'; }
                if (this.column)
                    { return 'column'; }
                return 'auto';
            },
            enumerable: true,
            configurable: true
        });
        DropList.prototype.destroyed = function () {
            exports.dnd.off("dragstart", this.onDragStart);
            exports.dnd.off("dragend", this.onDragEnd);
        };
        // Presence of feedback node in the DOM and of keys in the virtual DOM required => delayed until what
        // depends on drag data has been processed.
        DropList.prototype.refresh = function () {
            var _this = this;
            this.$nextTick(function () {
                _this.grid = _this.computeInsertingGrid();
                _this.feedbackKey = _this.computeFeedbackKey();
                _this.forbiddenKeys = _this.computeForbiddenKeys();
            });
        };
        DropList.prototype.onDragStart = function (event) {
            if (this.candidate(exports.dnd.type, exports.dnd.data, exports.dnd.source)) {
                if (this.reordering) {
                    this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
                    this.grid = this.computeReorderingGrid();
                }
                else {
                    this.refresh();
                }
            }
        };
        DropList.prototype.onDragEnd = function () {
            this.fromIndex = null;
            this.feedbackKey = null;
            this.forbiddenKeys = null;
            this.grid = null;
        };
        Object.defineProperty(DropList.prototype, "reordering", {
            get: function () {
                if (exports.dnd.inProgress) {
                    return exports.dnd.source.$el.parentElement === this.$el && this.$listeners.hasOwnProperty('reorder');
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "closestIndex", {
            get: function () {
                if (this.grid) {
                    return this.grid.closestIndex(exports.dnd.position);
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "dropAllowed", {
            get: function () {
                if (this.dragInProgress) {
                    if (this.reordering) {
                        return this.items.length > 1;
                    }
                    else {
                        var superDropAllowed = DropMixin['options'].computed.dropAllowed.get.call(this);
                        if (!superDropAllowed) {
                            return false;
                        }
                        else {
                            if (this.forbiddenKeys !== null && this.feedbackKey !== null) {
                                return !this.forbiddenKeys.includes(this.feedbackKey);
                            }
                            else {
                                return null;
                            }
                        }
                    }
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "itemsBeforeFeedback", {
            get: function () {
                if (this.closestIndex === 0) {
                    return [];
                }
                else {
                    return this.items.slice(0, this.closestIndex);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "itemsAfterFeedback", {
            get: function () {
                if (this.closestIndex === this.items.length) {
                    return [];
                }
                else {
                    return this.items.slice(this.closestIndex);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "itemsBeforeReorderingFeedback", {
            get: function () {
                if (this.closestIndex <= this.fromIndex) {
                    return this.items.slice(0, this.closestIndex);
                }
                else {
                    return this.items.slice(0, this.closestIndex + 1);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "itemsAfterReorderingFeedback", {
            get: function () {
                if (this.closestIndex <= this.fromIndex) {
                    return this.items.slice(this.closestIndex);
                }
                else {
                    return this.items.slice(this.closestIndex + 1);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "reorderedItems", {
            get: function () {
                var toIndex = this.closestIndex;
                var reordered = __spread(this.items);
                var temp = reordered[this.fromIndex];
                reordered.splice(this.fromIndex, 1);
                reordered.splice(toIndex, 0, temp);
                return reordered;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "clazz", {
            get: function () {
                return __assign({ 'drop-list': true, 'reordering': this.reordering === true, 'inserting': this.reordering === false }, (this.reordering === false ? this.cssClasses : { 'dnd-drop': true }));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "style", {
            get: function () {
                return __assign({}, (this.reordering === false ? this.cssStyle : {}));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "showDragFeedback", {
            get: function () {
                return this.dragInProgress && this.typeAllowed && !this.reordering;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "showInsertingDragImage", {
            get: function () {
                return this.dragInProgress && this.typeAllowed && !this.reordering && this.$scopedSlots.hasOwnProperty("drag-image");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropList.prototype, "showReorderingDragImage", {
            get: function () {
                return this.dragInProgress && this.reordering && this.$scopedSlots.hasOwnProperty("reordering-drag-image");
            },
            enumerable: true,
            configurable: true
        });
        DropList.prototype.doDrop = function (event) {
            if (this.reordering) {
                if (this.fromIndex !== this.closestIndex) {
                    this.$emit('reorder', new ReorderEvent(this.fromIndex, this.closestIndex));
                }
            }
            else {
                DropMixin['options'].methods.doDrop.call(this, event);
                this.$emit('insert', new InsertEvent(event.type, event.data, this.closestIndex));
            }
        };
        DropList.prototype.candidate = function (type, data, source) {
            var _a;
            var superCandidate = (_a = DropMixin['options'].methods.candidate).call.apply(_a, __spread([this], arguments));
            return (superCandidate && (this.$listeners.hasOwnProperty("insert") || this.$listeners.hasOwnProperty("drop"))) || this.reordering;
        };
        DropList.prototype.computeForbiddenKeys = function () {
            var vnodes = this.noAnimations ? [] : this.$children[0].$vnode.context.$children[0].$slots.default;
            return vnodes
                .map(function (vn) { return vn.key; })
                .filter(function (k) { return k !== undefined && k !== 'drag-image' && k !== 'drag-feedback'; });
        };
        DropList.prototype.computeFeedbackKey = function () {
            return this.$refs['feedback']['$slots']['default'][0]['key'];
        };
        Object.defineProperty(DropList.prototype, "hasReorderingFeedback", {
            get: function () {
                return this.$scopedSlots.hasOwnProperty("reordering-feedback");
            },
            enumerable: true,
            configurable: true
        });
        DropList.prototype.computeInsertingGrid = function () {
            var feedbackParent = this.$refs['feedback']['$el'];
            var feedback = feedbackParent.children[0];
            var clone = feedback.cloneNode(true);
            var tg = this.$el;
            if (tg.children.length > this.items.length) {
                tg.insertBefore(clone, tg.children[this.items.length]);
            }
            else {
                tg.appendChild(clone);
            }
            var grid = new Grid(tg.children, this.items.length, this.direction, null);
            tg.removeChild(clone);
            return grid;
        };
        DropList.prototype.computeReorderingGrid = function () {
            var tg = this.$el;
            return new Grid(tg.children, this.items.length - 1, this.direction, this.fromIndex);
        };
        DropList.prototype.createDragImage = function () {
            var image;
            if (this.$refs['drag-image']) {
                var el = this.$refs['drag-image'];
                var model = void 0;
                if (el.childElementCount !== 1) {
                    model = el;
                }
                else {
                    model = el.children.item(0);
                }
                var clone = model.cloneNode(true);
                var tg = this.$el;
                tg.appendChild(clone);
                image = createDragImage(clone);
                tg.removeChild(clone);
                image['__opacity'] = this.dragImageOpacity;
                image.classList.add('dnd-ghost');
            }
            else {
                image = 'source';
            }
            return image;
        };
        __decorate([
            vuePropertyDecorator.Prop({ default: 'div', type: [String, Object, Function] }),
            __metadata("design:type", Object)
        ], DropList.prototype, "tag", void 0);
        __decorate([
            vuePropertyDecorator.Prop(),
            __metadata("design:type", Array)
        ], DropList.prototype, "items", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: null }),
            __metadata("design:type", Boolean)
        ], DropList.prototype, "row", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: null, type: Boolean }),
            __metadata("design:type", Boolean)
        ], DropList.prototype, "column", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ default: false, type: Boolean }),
            __metadata("design:type", Boolean)
        ], DropList.prototype, "noAnimations", void 0);
        __decorate([
            vuePropertyDecorator.Prop({ type: Number, default: undefined }),
            __metadata("design:type", Number)
        ], DropList.prototype, "scrollingEdgeSize", void 0);
        DropList = __decorate([
            vuePropertyDecorator.Component({
                components: { DragFeedback: DragFeedback$1 },
                inheritAttrs: false
            })
        ], DropList);
        return DropList;
    }(DropMixin));

    /* script */
    var __vue_script__$4 = DropList;

    /* template */
    var __vue_render__$4 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.rootTag,_vm._g(_vm._b({tag:"component",class:_vm.clazz,style:(_vm.style)},'component',_vm.rootProps,false),_vm.rootListeners),[(_vm.dropIn && _vm.dropAllowed)?[(_vm.reordering)?[(_vm.hasReorderingFeedback)?[_vm._l((_vm.itemsBeforeReorderingFeedback),function(item,index){return _vm._t("item",null,{"item":item,"index":index})}),_vm._v(" "),_vm._t("reordering-feedback",null,{"item":_vm.items[_vm.fromIndex]}),_vm._v(" "),_vm._l((_vm.itemsAfterReorderingFeedback),function(item,index){return _vm._t("item",null,{"item":item,"index":_vm.itemsBeforeReorderingFeedback.length + index})})]:[_vm._l((_vm.reorderedItems),function(item,index){return _vm._t("item",null,{"item":item,"index":index,"reorder":index === _vm.closestIndex})})]]:[_vm._l((_vm.itemsBeforeFeedback),function(item,index){return _vm._t("item",null,{"item":item,"reorder":false,"index":index})}),_vm._v(" "),_vm._t("feedback",null,{"data":_vm.dragData,"type":_vm.dragType}),_vm._v(" "),_vm._l((_vm.itemsAfterFeedback),function(item,index){return _vm._t("item",null,{"item":item,"reorder":false,"index":_vm.itemsBeforeFeedback.length + index})})]]:[_vm._l((_vm.items),function(item,index){return _vm._t("item",null,{"item":item,"reorder":false,"index":index})}),_vm._v(" "),(_vm.items.length < 1)?_vm._t("empty"):_vm._e()],_vm._v(" "),(_vm.showDragFeedback)?_c('drag-feedback',{key:"drag-feedback",ref:"feedback",staticClass:"__feedback"},[_vm._t("feedback",null,{"data":_vm.dragData,"type":_vm.dragType})],2):_vm._e(),_vm._v(" "),(_vm.showInsertingDragImage)?_c('div',{key:"inserting-drag-image",ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e(),_vm._v(" "),(_vm.showReorderingDragImage)?_c('div',{key:"reordering-drag-image",ref:"drag-image",staticClass:"__drag-image"},[_vm._t("reordering-drag-image",null,{"item":_vm.items[_vm.fromIndex]})],2):_vm._e(),_vm._v(" "),_vm._t("default")],2)};
    var __vue_staticRenderFns__$4 = [];

      /* style */
      var __vue_inject_styles__$4 = function (inject) {
        if (!inject) { return }
        inject("data-v-6cf267bc_0", { source: ".drop-list[data-v-6cf267bc]>*{transition:transform .2s}.__feedback[data-v-6cf267bc]{display:none}.__drag-image[data-v-6cf267bc]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined })
    ,inject("data-v-6cf267bc_1", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__$4 = "data-v-6cf267bc";
      /* module identifier */
      var __vue_module_identifier__$4 = undefined;
      /* functional template */
      var __vue_is_functional_template__$4 = false;
      /* style inject SSR */
      

      
      var DropList$1 = normalizeComponent_1(
        { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
        __vue_inject_styles__$4,
        __vue_script__$4,
        __vue_scope_id__$4,
        __vue_is_functional_template__$4,
        __vue_module_identifier__$4,
        browser,
        undefined
      );

    exports.DnDEvent = DnDEvent;
    exports.Drag = Drag$1;
    exports.DragAwareMixin = DragAwareMixin;
    exports.DragImagesManager = DragImagesManager;
    exports.DragMixin = DragMixin;
    exports.Drop = Drop$1;
    exports.DropList = DropList$1;
    exports.DropMask = DropMask$1;
    exports.DropMixin = DropMixin;
    exports.InsertEvent = InsertEvent;
    exports.ReorderEvent = ReorderEvent;
    exports.createDragImage = createDragImage;

    return exports;

}({}, null, VuePropertyDecorator));
