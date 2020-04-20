import 'reflect-metadata';
import { Vue, Component, Prop } from 'vue-property-decorator';

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

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

/**
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits events
 * reporting its state evolution during the progress of the drag and drop. Its data is reactive and listeners can be
 * attachted to it using the method on.
 */
var DnD = function DnD() {
    this.inProgress = false;
    this.type = null;
    this.data = null;
    this.source = null;
    this.top = null;
    this.position = null;
    this.eventBus = new Vue();
    this.sourceListeners = null;
};
DnD.prototype.startDrag = function startDrag (source, event, x, y, type, data) {
    this.type = type;
    this.data = data;
    this.source = source;
    this.position = {
        x: x,
        y: y
    };
    this.top = null;
    this.sourceListeners = source.$listeners;
    this.inProgress = true;
    this.emit(event, "dragstart");
    this.emit(event, "dragtopchanged", { previousTop: null });
};
DnD.prototype.stopDrag = function stopDrag (event) {
    if (this.top !== null) {
        this.emit(event, "drop");
    }
    this.emit(event, "dragend");
    this.inProgress = false;
    this.data = null;
    this.source = null;
    this.position = null;
};
DnD.prototype.mouseMove = function mouseMove (event, comp) {
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
DnD.prototype.emit = function emit (native, event, data) {
    this.eventBus.$emit(event, Object.assign({}, {type: this.type,
        data: this.data,
        top: this.top,
        source: this.source,
        position: this.position,
        native: native},
        data));
};
DnD.prototype.on = function on (event, callback) {
    this.eventBus.$on(event, callback);
};
DnD.prototype.off = function off (event, callback) {
    this.eventBus.$off(event, callback);
};
var dnd = new DnD();
dnd = Vue.observable(dnd);

var DragAwareMixin = /*@__PURE__*/(function (Vue) {
    function DragAwareMixin () {
        Vue.apply(this, arguments);
    }

    if ( Vue ) DragAwareMixin.__proto__ = Vue;
    DragAwareMixin.prototype = Object.create( Vue && Vue.prototype );
    DragAwareMixin.prototype.constructor = DragAwareMixin;

    var prototypeAccessors = { dragInProgress: { configurable: true },dragData: { configurable: true },dragType: { configurable: true },dragPosition: { configurable: true },dragSource: { configurable: true },dragTop: { configurable: true } };

    prototypeAccessors.dragInProgress.get = function () {
        return dnd.inProgress;
    };
    prototypeAccessors.dragData.get = function () {
        return dnd.data;
    };
    prototypeAccessors.dragType.get = function () {
        return dnd.type;
    };
    prototypeAccessors.dragPosition.get = function () {
        return dnd.position;
    };
    prototypeAccessors.dragSource.get = function () {
        return dnd.source;
    };
    prototypeAccessors.dragTop.get = function () {
        return dnd.top;
    };

    Object.defineProperties( DragAwareMixin.prototype, prototypeAccessors );

    return DragAwareMixin;
}(Vue));
DragAwareMixin = __decorate([
    Component({})
], DragAwareMixin);
var DragAwareMixin$1 = DragAwareMixin;

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
    var computedStyle = window.getComputedStyle(src);
    Array.from(computedStyle).forEach(function (key) {
        destination.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key));
    });
    destination.style.pointerEvents = 'none';
}

var DragMixin = /*@__PURE__*/(function (DragAwareMixin) {
    function DragMixin() {
        DragAwareMixin.apply(this, arguments);
        this.isDrag = true;
        this.mouseIn = null;
    }

    if ( DragAwareMixin ) DragMixin.__proto__ = DragAwareMixin;
    DragMixin.prototype = Object.create( DragAwareMixin && DragAwareMixin.prototype );
    DragMixin.prototype.constructor = DragMixin;

    var prototypeAccessors = { dragIn: { configurable: true },cssClasses: { configurable: true },currentDropMode: { configurable: true } };
    DragMixin.prototype.created = function created () {
        var this$1 = this;

        dnd.on("dragstart", function (event) { return this$1.$emit("dragstart", event); });
        dnd.on("dragend", function (event) { return this$1.$emit("dragend", event); });
    };
    DragMixin.prototype.mounted = function mounted () {
        var isNodeList = function (el) {
            return 'item' in el;
        };
        var comp = this;
        var el = this.$el;
        var dragStarted = false;
        var initialUserSelect;
        var downEvent = null;
        var startPosition = null;
        if (this.handle) {
            el = this.$el.querySelectorAll(this.handle);
        }
        if (isNodeList(el)) {
            el.forEach(function (element) {
                element.addEventListener('mousedown', onMouseDown);
                element.addEventListener('touchstart', onMouseDown);
                element.addEventListener('mouseenter', onMouseEnter);
                element.addEventListener('mouseleave', onMouseLeave);
            });
        }
        else {
            el.addEventListener('mousedown', onMouseDown);
            el.addEventListener('touchstart', onMouseDown);
            el.addEventListener('mouseenter', onMouseEnter);
            el.addEventListener('mouseleave', onMouseLeave);
        }
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
        function onMouseDown(e) {
            if (!comp.disabled && downEvent === null) {
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
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('touchmove', onMouseMove, { passive: false });
                document.addEventListener('easy-dnd-move', onEasyDnDMove);
                document.addEventListener('mouseup', onMouseUp);
                document.addEventListener('touchend', onMouseUp);
                document.addEventListener('selectstart', noop);
                // Prevents event from bubbling to ancestor drag components and initiate several drags at the same time
                e.stopPropagation();
                // Prevents touchstart event to be converted to mousedown
                //e.preventDefault();
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
                dragStarted = true;
                dnd.startDrag(comp, downEvent, startPosition.x, startPosition.y, comp.type, comp.data);
                document.documentElement.classList.add('drag-in-progress');
            }
            // Dispatch custom easy-dnd-move event :
            if (dragStarted) {
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
            // Prevent scroll on touch devices :
            e.preventDefault();
        }
        function onEasyDnDMove(e) {
            dnd.mouseMove(e, null);
        }
        function onMouseUp(e) {
            // On touch devices, we ignore fake mouse events and deal with touch events only.
            if (downEvent.type === 'touchstart' && e.type === 'mouseup')
                { return; }
            downEvent = null;
            // This delay makes sure that when the click event that results from the mouseup is produced, the drag is still
            // in progress. So by checking the flag dnd.inProgress, one can tell appart true clicks from drag and drop artefacts.
            setTimeout(function () {
                if (dragStarted) {
                    document.documentElement.classList.remove('drag-in-progress');
                    dnd.stopDrag(e);
                }
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('easy-dnd-move', onEasyDnDMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('touchend', onMouseUp);
                document.removeEventListener('selectstart', noop);
                document.documentElement.style.userSelect = initialUserSelect;
            }, 0);
        }
    };
    prototypeAccessors.dragIn.get = function () {
        return !this.dragInProgress && this.mouseIn;
    };
    prototypeAccessors.cssClasses.get = function () {
        if (!this.disabled) {
            return {
                'drag-source': this.dragInProgress && this.dragSource === this,
                'drag-in': this.dragIn,
                'drag-out': !this.dragIn,
                'drag-mode-copy': this.currentDropMode === 'copy',
                'drag-mode-cut': this.currentDropMode === 'cut',
                'drag-mode-reordering': this.currentDropMode === 'reordering',
            };
        }
        else {
            return {};
        }
    };
    prototypeAccessors.currentDropMode.get = function () {
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
    };
    DragMixin.prototype.createDragImage = function createDragImage$1 (selfTransform) {
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
        image['__opacity'] = this.dragImageOpacity;
        return image;
    };

    Object.defineProperties( DragMixin.prototype, prototypeAccessors );

    return DragMixin;
}(DragAwareMixin$1));
__decorate([
    Prop({ default: null, type: null }),
    __metadata("design:type", String)
], DragMixin.prototype, "type", void 0);
__decorate([
    Prop({ default: null, type: null }),
    __metadata("design:type", Object)
], DragMixin.prototype, "data", void 0);
__decorate([
    Prop({ default: 0.7, type: Number }),
    __metadata("design:type", Object)
], DragMixin.prototype, "dragImageOpacity", void 0);
__decorate([
    Prop({ default: false, type: Boolean }),
    __metadata("design:type", Boolean)
], DragMixin.prototype, "disabled", void 0);
__decorate([
    Prop({ required: false, type: String }),
    __metadata("design:type", String)
], DragMixin.prototype, "handle", void 0);
__decorate([
    Prop({ type: Number, default: 3 }),
    __metadata("design:type", Number)
], DragMixin.prototype, "delta", void 0);
DragMixin = __decorate([
    Component({})
], DragMixin);
var DragMixin$1 = DragMixin;

var Drag = /*@__PURE__*/(function (DragMixin) {
    function Drag () {
        DragMixin.apply(this, arguments);
    }if ( DragMixin ) Drag.__proto__ = DragMixin;
    Drag.prototype = Object.create( DragMixin && DragMixin.prototype );
    Drag.prototype.constructor = Drag;

    

    return Drag;
}(DragMixin$1));
__decorate([
    Prop({ default: 'div', type: [String, Object] }),
    __metadata("design:type", Object)
], Drag.prototype, "tag", void 0);
Drag = __decorate([
    Component({})
], Drag);
var script = Drag;

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
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.cssClasses,style:({cursor: _vm.disabled || _vm.handle ? null : 'grab'}),scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),_c('div',{ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image")],2)],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-4ce62e8b_0", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined })
,inject("data-v-4ce62e8b_1", { source: "html.drag-in-progress *{cursor:grabbing!important}", map: undefined, media: undefined })
,inject("data-v-4ce62e8b_2", { source: ".__drag-image[data-v-4ce62e8b]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-4ce62e8b";
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

var DropMixin = /*@__PURE__*/(function (DragAwareMixin) {
    function DropMixin() {
        DragAwareMixin.call(this);
        this.isDrop = true;
    }

    if ( DragAwareMixin ) DropMixin.__proto__ = DragAwareMixin;
    DropMixin.prototype = Object.create( DragAwareMixin && DragAwareMixin.prototype );
    DropMixin.prototype.constructor = DropMixin;

    var prototypeAccessors = { compatibleMode: { configurable: true },dropIn: { configurable: true },typeAllowed: { configurable: true },dropAllowed: { configurable: true },cssClasses: { configurable: true },cssStyle: { configurable: true } };
    DropMixin.prototype.effectiveAcceptsType = function effectiveAcceptsType (type) {
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
    DropMixin.prototype.effectiveAcceptsData = function effectiveAcceptsData (data, type) {
        return this.acceptsData(data, type);
    };
    DropMixin.prototype.created = function created () {
        dnd.on("dragpositionchanged", this.onDragPositionChanged);
        dnd.on("dragtopchanged", this.onDragTopChanged);
        dnd.on("drop", this.onDrop);
    };
    DropMixin.prototype.destroyed = function destroyed () {
        dnd.off("dragpositionchanged", this.onDragPositionChanged);
        dnd.off("dragtopchanged", this.onDragTopChanged);
        dnd.off("drop", this.onDrop);
    };
    DropMixin.prototype.onDragPositionChanged = function onDragPositionChanged (event) {
        if (this === event.top) {
            this.$emit("dragover", event);
        }
    };
    DropMixin.prototype.onDragTopChanged = function onDragTopChanged (event) {
        if (this === event.top) {
            this.$emit("dragenter", event);
        }
        if (this === event.previousTop) {
            this.$emit("dragleave", event);
        }
    };
    DropMixin.prototype.onDrop = function onDrop (event) {
        if (this.dropIn && this.compatibleMode && this.dropAllowed) {
            this.doDrop(event);
        }
    };
    DropMixin.prototype.doDrop = function doDrop (event) {
        this.$emit('drop', event);
        event.source.$emit(this.mode, event);
    };
    DropMixin.prototype.mounted = function mounted () {
        var el = this.$el;
        var comp = this;
        el.addEventListener('easy-dnd-move', onMouseMove);
        function onMouseMove(e) {
            dnd.mouseMove(e, comp);
        }
    };
    prototypeAccessors.compatibleMode.get = function () {
        if (this.dragInProgress) {
            return this.mode === 'copy' || dnd.sourceListeners.hasOwnProperty(this.mode);
        }
        else {
            return null;
        }
    };
    prototypeAccessors.dropIn.get = function () {
        if (this.dragInProgress) {
            return this.dragTop === this;
        }
        else {
            return null;
        }
    };
    prototypeAccessors.typeAllowed.get = function () {
        if (this.dragInProgress) {
            return this.effectiveAcceptsType(this.dragType);
        }
        else {
            return null;
        }
    };
    prototypeAccessors.dropAllowed.get = function () {
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
    };
    prototypeAccessors.cssClasses.get = function () {
        var clazz = {
            'dnd-drop': true
        };
        if (this.dropIn !== null) {
            clazz = Object.assign({}, clazz,
                {"drop-in": this.dropIn,
                "drop-out": !this.dropIn});
        }
        if (this.typeAllowed !== null) {
            clazz = Object.assign({}, clazz,
                {"type-allowed": this.typeAllowed,
                "type-forbidden": !this.typeAllowed});
        }
        if (this.dropAllowed !== null) {
            clazz = Object.assign({}, clazz,
                {"drop-allowed": this.dropAllowed,
                "drop-forbidden": !this.dropAllowed});
        }
        return clazz;
    };
    prototypeAccessors.cssStyle.get = function () {
        if (this.dropAllowed && this.dropIn) {
            return { cursor: this.cursor + ' !important' };
        }
        else {
            return { cursor: 'inherit' };
        }
    };
    /**
     * Returns true if the current drop area participates in the current drag operation.
     */
    DropMixin.prototype.candidate = function candidate (type, data, source) {
        return this.effectiveAcceptsType(type);
    };
    DropMixin.prototype.createDragImage = function createDragImage$1 () {
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
        }
        else {
            image = 'source';
        }
        return image;
    };

    Object.defineProperties( DropMixin.prototype, prototypeAccessors );

    return DropMixin;
}(DragAwareMixin$1));
__decorate([
    Prop({ default: function () { return function () { return true; }; }, type: [String, Array, Function] }),
    __metadata("design:type", Object)
], DropMixin.prototype, "acceptsType", void 0);
__decorate([
    Prop({ default: function () { return function () { return true; }; }, type: Function }),
    __metadata("design:type", Object)
], DropMixin.prototype, "acceptsData", void 0);
__decorate([
    Prop({ default: 'pointer' }),
    __metadata("design:type", String)
], DropMixin.prototype, "cursor", void 0);
__decorate([
    Prop({ default: 'copy' }),
    __metadata("design:type", String)
], DropMixin.prototype, "mode", void 0);
__decorate([
    Prop({ default: 0.7, type: Number }),
    __metadata("design:type", Object)
], DropMixin.prototype, "dragImageOpacity", void 0);
DropMixin = __decorate([
    Component({}),
    __metadata("design:paramtypes", [])
], DropMixin);
var DropMixin$1 = DropMixin;

var Drop = /*@__PURE__*/(function (DropMixin) {
    function Drop () {
        DropMixin.apply(this, arguments);
    }

    if ( DropMixin ) Drop.__proto__ = DropMixin;
    Drop.prototype = Object.create( DropMixin && DropMixin.prototype );
    Drop.prototype.constructor = Drop;

    var prototypeAccessors = { showDragImage: { configurable: true } };

    prototypeAccessors.showDragImage.get = function () {
        return this.dragInProgress && this.typeAllowed && this.$scopedSlots['drag-image'];
    };

    Object.defineProperties( Drop.prototype, prototypeAccessors );

    return Drop;
}(DropMixin$1));
__decorate([
    Prop({ default: 'div', type: [String, Object] }),
    __metadata("design:type", Object)
], Drop.prototype, "tag", void 0);
Drop = __decorate([
    Component({})
], Drop);
var script$1 = Drop;

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.cssClasses,style:(_vm.cssStyle),scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),(_vm.showDragImage)?_c('div',{ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e()],2)};
var __vue_staticRenderFns__$1 = [];

  /* style */
  var __vue_inject_styles__$1 = function (inject) {
    if (!inject) { return }
    inject("data-v-755d0872_0", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined })
,inject("data-v-755d0872_1", { source: ".__drag-image[data-v-755d0872]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$1 = "data-v-755d0872";
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

var DropMask = /*@__PURE__*/(function (DragAwareMixin) {
    function DropMask() {
        DragAwareMixin.apply(this, arguments);
        this.isDropMask = true;
    }

    if ( DragAwareMixin ) DropMask.__proto__ = DragAwareMixin;
    DropMask.prototype = Object.create( DragAwareMixin && DragAwareMixin.prototype );
    DropMask.prototype.constructor = DropMask;
    DropMask.prototype.mounted = function mounted () {
        var el = this.$el;
        var comp = this;
        el.addEventListener('easy-dnd-move', onMouseMove);
        function onMouseMove(e) {
            dnd.mouseMove(e, comp);
        }
    };
    DropMask.prototype.createDragImage = function createDragImage () {
        return 'source';
    };

    return DropMask;
}(DragAwareMixin$1));
__decorate([
    Prop({ default: 'div', type: [String, Object] }),
    __metadata("design:type", Object)
], DropMask.prototype, "tag", void 0);
DropMask = __decorate([
    Component({})
], DropMask);
var script$2 = DropMask;

/* script */
var __vue_script__$2 = script$2;

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
var DragImagesManager = /*@__PURE__*/(function (Vue) {
    function DragImagesManager() {
        Vue.call(this);
        this.selfTransform = null;
        this.clones = null;
        this.source = null;
        this.sourceClone = null;
        dnd.on('dragstart', this.onDragStart);
        dnd.on('dragtopchanged', this.onDragTopChanged);
        dnd.on('dragpositionchanged', this.onDragPositionChanged);
        dnd.on('dragend', this.onDragEnd);
    }

    if ( Vue ) DragImagesManager.__proto__ = Vue;
    DragImagesManager.prototype = Object.create( Vue && Vue.prototype );
    DragImagesManager.prototype.constructor = DragImagesManager;
    DragImagesManager.prototype.onDragStart = function onDragStart (event) {
        var sourcePos = {
            x: event.source.$el.getBoundingClientRect().left,
            y: event.source.$el.getBoundingClientRect().top
        };
        this.selfTransform = "translate(-" + (event.position.x - sourcePos.x) + "px, -" + (event.position.y - sourcePos.y) + "px)";
        this.clones = new Map();
        this.source = event.source;
    };
    DragImagesManager.prototype.onDragEnd = function onDragEnd (event) {
        var this$1 = this;

        Vue.nextTick(function () {
            this$1.clones.forEach(function (clone) {
                clone.remove();
            });
            if (this$1.sourceClone !== null) {
                this$1.sourceClone.remove();
            }
            this$1.selfTransform = null;
            this$1.clones = null;
            this$1.source = null;
            this$1.sourceClone = null;
        });
    };
    DragImagesManager.prototype.onDragTopChanged = function onDragTopChanged (event) {
        var top = event.top;
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
                    document.body.append(clone);
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
    };
    DragImagesManager.prototype.getSourceClone = function getSourceClone () {
        if (this.sourceClone === null) {
            this.sourceClone = this.source['createDragImage'](this.selfTransform);
            this.sourceClone.style.opacity = '0';
            document.body.append(this.sourceClone);
        }
        return this.sourceClone;
    };
    DragImagesManager.prototype.onDragPositionChanged = function onDragPositionChanged (event) {
        this.clones.forEach(function (clone) {
            clone.style.left = dnd.position.x + "px";
            clone.style.top = dnd.position.y + "px";
        });
        if (this.sourceClone) {
            this.sourceClone.style.left = dnd.position.x + "px";
            this.sourceClone.style.top = dnd.position.y + "px";
        }
    };

    return DragImagesManager;
}(Vue));
DragImagesManager = __decorate([
    Component({}) // Necessary to set proper "this" context in event listeners.
    ,
    __metadata("design:paramtypes", [])
], DragImagesManager);
new DragImagesManager();

var DragFeedback = /*@__PURE__*/(function (Vue) {
    function DragFeedback () {
        Vue.apply(this, arguments);
    }if ( Vue ) DragFeedback.__proto__ = Vue;
    DragFeedback.prototype = Object.create( Vue && Vue.prototype );
    DragFeedback.prototype.constructor = DragFeedback;

    

    return DragFeedback;
}(Vue));
DragFeedback = __decorate([
    Component({})
], DragFeedback);
var script$3 = DragFeedback;

/* script */
var __vue_script__$3 = script$3;

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

var Grid = function Grid(collection, upToIndex, row, fromIndex) {
    this.magnets = [];
    var index = 0;
    for (var i = 0, list = collection; i < list.length; i += 1) {
        var child = list[i];

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
};
/**
 * Returns the center of the rectangle.
 */
Grid.prototype.center = function center (rect) {
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
};
/**
 * When horizontal is true / false, returns middle of the left / top side of the rectangle.
 */
Grid.prototype.before = function before (rect, horizontal) {
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
Grid.prototype.after = function after (rect, horizontal) {
    return horizontal ? {
        x: rect.left + rect.width,
        y: rect.top + rect.height / 2
    } : {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height
    };
};
Grid.prototype.closestIndex = function closestIndex (position) {
    var minDist = 999999;
    var index = -1;
    for (var i = 0; i < this.magnets.length; i++) {
        var magnet = this.magnets[i];
        var dist = Math.sqrt(Math.pow(magnet.x - position.x, 2) + Math.pow(magnet.y - position.y, 2));
        if (dist < minDist) {
            minDist = dist;
            index = i;
        }
    }
    return index;
};

var DnDEvent = function DnDEvent () {};
var ReorderEvent = function ReorderEvent(from, to) {
    this.from = from;
    this.to = to;
};
ReorderEvent.prototype.apply = function apply (array) {
    var tmp = array[this.from];
    array.splice(this.from, 1);
    array.splice(this.to, 0, tmp);
};
var InsertEvent = function InsertEvent(type, data, index) {
    this.type = type;
    this.data = data;
    this.index = index;
};

var DropList = /*@__PURE__*/(function (DropMixin) {
    function DropList() {
        DropMixin.apply(this, arguments);
        this.grid = null;
        this.forbiddenKeys = [];
        this.feedbackKey = null;
        this.fromIndex = null;
    }

    if ( DropMixin ) DropList.__proto__ = DropMixin;
    DropList.prototype = Object.create( DropMixin && DropMixin.prototype );
    DropList.prototype.constructor = DropList;

    var prototypeAccessors = { direction: { configurable: true },reordering: { configurable: true },closestIndex: { configurable: true },dropAllowed: { configurable: true },itemsBeforeFeedback: { configurable: true },itemsAfterFeedback: { configurable: true },itemsBeforeReorderingFeedback: { configurable: true },itemsAfterReorderingFeedback: { configurable: true },reorderedItems: { configurable: true },clazz: { configurable: true },style: { configurable: true },showDragFeedback: { configurable: true },showInsertingDragImage: { configurable: true },showReorderingDragImage: { configurable: true },hasReorderingFeedback: { configurable: true } };
    DropList.prototype.created = function created () {
        dnd.on("dragstart", this.onDragStart);
        dnd.on("dragend", this.onDragEnd);
    };
    prototypeAccessors.direction.get = function () {
        if (this.row)
            { return 'row'; }
        if (this.column)
            { return 'column'; }
        return 'auto';
    };
    DropList.prototype.destroyed = function destroyed () {
        dnd.off("dragstart", this.onDragStart);
        dnd.off("dragend", this.onDragEnd);
    };
    DropList.prototype.onDragStart = function onDragStart (event) {
        var this$1 = this;

        if (this.candidate(dnd.type, dnd.data, dnd.source)) {
            if (this.reordering) {
                this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
                this.grid = this.computeReorderingGrid();
            }
            else {
                this.$nextTick(function () {
                    // Presence of feedback node in the DOM and of keys in the virtual DOM required => delayed until what
                    // depends on drag data has been processed.
                    this$1.grid = this$1.computeInsertingGrid();
                    this$1.feedbackKey = this$1.computeFeedbackKey();
                    this$1.forbiddenKeys = this$1.computeForbiddenKeys();
                });
            }
        }
    };
    DropList.prototype.onDragEnd = function onDragEnd () {
        this.fromIndex = null;
        this.feedbackKey = null;
        this.forbiddenKeys = null;
        this.grid = null;
    };
    prototypeAccessors.reordering.get = function () {
        if (dnd.inProgress) {
            return dnd.source.$el.parentElement === this.$el && this.$listeners.hasOwnProperty('reorder');
        }
        else {
            return null;
        }
    };
    prototypeAccessors.closestIndex.get = function () {
        if (this.grid) {
            return this.grid.closestIndex(dnd.position);
        }
        else {
            return null;
        }
    };
    prototypeAccessors.dropAllowed.get = function () {
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
    };
    prototypeAccessors.itemsBeforeFeedback.get = function () {
        if (this.closestIndex === 0) {
            return [];
        }
        else {
            return this.items.slice(0, this.closestIndex);
        }
    };
    prototypeAccessors.itemsAfterFeedback.get = function () {
        if (this.closestIndex === this.items.length) {
            return [];
        }
        else {
            return this.items.slice(this.closestIndex);
        }
    };
    prototypeAccessors.itemsBeforeReorderingFeedback.get = function () {
        if (this.closestIndex <= this.fromIndex) {
            return this.items.slice(0, this.closestIndex);
        }
        else {
            return this.items.slice(0, this.closestIndex + 1);
        }
    };
    prototypeAccessors.itemsAfterReorderingFeedback.get = function () {
        if (this.closestIndex <= this.fromIndex) {
            return this.items.slice(this.closestIndex);
        }
        else {
            return this.items.slice(this.closestIndex + 1);
        }
    };
    prototypeAccessors.reorderedItems.get = function () {
        var toIndex = this.closestIndex;
        var reordered = [].concat( this.items );
        var temp = reordered[this.fromIndex];
        reordered.splice(this.fromIndex, 1);
        reordered.splice(toIndex, 0, temp);
        return reordered;
    };
    prototypeAccessors.clazz.get = function () {
        return Object.assign({}, {'drop-list': true,
            'reordering': this.reordering === true,
            'inserting': this.reordering === false},
            (this.reordering === false ? this.cssClasses : { 'dnd-drop': true }));
    };
    prototypeAccessors.style.get = function () {
        return Object.assign({}, (this.reordering === false ? this.cssStyle : {}));
    };
    prototypeAccessors.showDragFeedback.get = function () {
        return this.dragInProgress && this.typeAllowed && !this.reordering;
    };
    prototypeAccessors.showInsertingDragImage.get = function () {
        return this.dragInProgress && this.typeAllowed && !this.reordering && this.$scopedSlots.hasOwnProperty("drag-image");
    };
    prototypeAccessors.showReorderingDragImage.get = function () {
        return this.dragInProgress && this.reordering && this.$scopedSlots.hasOwnProperty("reordering-drag-image");
    };
    DropList.prototype.doDrop = function doDrop (event) {
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
    DropList.prototype.candidate = function candidate (type, data, source) {
        var i = arguments.length, argsArray = Array(i);
        while ( i-- ) argsArray[i] = arguments[i];
        var ref;

        var superCandidate = (ref = DropMixin['options'].methods.candidate).call.apply(ref, [ this ].concat( argsArray ));
        return (superCandidate && (this.$listeners.hasOwnProperty("insert") || this.$listeners.hasOwnProperty("drop"))) || this.reordering;
    };
    DropList.prototype.computeForbiddenKeys = function computeForbiddenKeys () {
        return this.$children[0].$vnode.context.$children[0].$slots.default
            .map(function (vn) { return vn.key; })
            .filter(function (k) { return k !== undefined && k !== 'drag-image' && k !== 'drag-feedback'; });
    };
    DropList.prototype.computeFeedbackKey = function computeFeedbackKey () {
        return this.$refs['feedback']['$slots']['default'][0]['key'];
    };
    prototypeAccessors.hasReorderingFeedback.get = function () {
        return this.$scopedSlots.hasOwnProperty("reordering-feedback");
    };
    DropList.prototype.computeInsertingGrid = function computeInsertingGrid () {
        var feedbackParent = this.$refs['feedback']['$el'];
        var feedback = feedbackParent.children[0];
        var clone = feedback.cloneNode(true);
        var tg = this.$refs['tg']['$el'];
        if (tg.children.length > this.items.length) {
            tg.insertBefore(clone, tg.children[this.items.length]);
        }
        else {
            tg.append(clone);
        }
        var grid = new Grid(tg.children, this.items.length, this.direction, null);
        clone.remove();
        return grid;
    };
    DropList.prototype.computeReorderingGrid = function computeReorderingGrid () {
        var tg = this.$refs['tg']['$el'];
        return new Grid(tg.children, this.items.length - 1, this.direction, this.fromIndex);
    };
    DropList.prototype.createDragImage = function createDragImage$1 () {
        var image;
        if (this.$refs['drag-image']) {
            var el = this.$refs['drag-image'];
            var model;
            if (el.childElementCount !== 1) {
                model = el;
            }
            else {
                model = el.children.item(0);
            }
            var clone = model.cloneNode(true);
            var tg = this.$el;
            tg.append(clone);
            image = createDragImage(clone);
            clone.remove();
            image['__opacity'] = this.dragImageOpacity;
        }
        else {
            image = 'source';
        }
        return image;
    };

    Object.defineProperties( DropList.prototype, prototypeAccessors );

    return DropList;
}(DropMixin$1));
__decorate([
    Prop({ default: 'div', type: [String, Object] }),
    __metadata("design:type", Object)
], DropList.prototype, "tag", void 0);
__decorate([
    Prop(),
    __metadata("design:type", Array)
], DropList.prototype, "items", void 0);
__decorate([
    Prop({ default: null }),
    __metadata("design:type", Boolean)
], DropList.prototype, "row", void 0);
__decorate([
    Prop({ default: null, type: Boolean }),
    __metadata("design:type", Boolean)
], DropList.prototype, "column", void 0);
DropList = __decorate([
    Component({
        components: { DragFeedback: DragFeedback$1 }
    })
], DropList);
var script$4 = DropList;

/* script */
var __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition-group',{ref:"tg",class:_vm.clazz,style:(_vm.style),attrs:{"tag":_vm.tag,"duration":{enter: 0, leave: 0},"css":false}},[(_vm.dropIn && _vm.dropAllowed)?[(_vm.reordering)?[(_vm.hasReorderingFeedback)?[_vm._l((_vm.itemsBeforeReorderingFeedback),function(item){return _vm._t("item",null,{"item":item})}),_vm._v(" "),_vm._t("reordering-feedback",null,{"item":_vm.items[_vm.fromIndex]}),_vm._v(" "),_vm._l((_vm.itemsAfterReorderingFeedback),function(item){return _vm._t("item",null,{"item":item})})]:[_vm._l((_vm.reorderedItems),function(item,index){return _vm._t("item",null,{"item":item,"reorder":index === _vm.closestIndex})})]]:[_vm._l((_vm.itemsBeforeFeedback),function(item){return _vm._t("item",null,{"item":item,"reorder":false})}),_vm._v(" "),_vm._t("feedback",null,{"data":_vm.dragData,"type":_vm.dragType}),_vm._v(" "),_vm._l((_vm.itemsAfterFeedback),function(item){return _vm._t("item",null,{"item":item,"reorder":false})})]]:[_vm._l((_vm.items),function(item){return _vm._t("item",null,{"item":item,"reorder":false})})],_vm._v(" "),(_vm.showDragFeedback)?_c('drag-feedback',{key:"drag-feedback",ref:"feedback",staticClass:"feedback"},[_vm._t("feedback",null,{"data":_vm.dragData,"type":_vm.dragType})],2):_vm._e(),_vm._v(" "),(_vm.showInsertingDragImage)?_c('div',{key:"inserting-drag-image",ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e(),_vm._v(" "),(_vm.showReorderingDragImage)?_c('div',{key:"reordering-drag-image",ref:"drag-image",staticClass:"__drag-image"},[_vm._t("reordering-drag-image",null,{"item":_vm.items[_vm.fromIndex]})],2):_vm._e(),_vm._v(" "),_c('div',{key:"drop-list-content"},[_vm._t("default")],2)],2)};
var __vue_staticRenderFns__$4 = [];

  /* style */
  var __vue_inject_styles__$4 = function (inject) {
    if (!inject) { return }
    inject("data-v-365fd9f9_0", { source: ".drag-in-progress .drop-list[data-v-365fd9f9]>*{transition:transform .2s}.feedback[data-v-365fd9f9]{display:none}.__drag-image[data-v-365fd9f9]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined })
,inject("data-v-365fd9f9_1", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$4 = "data-v-365fd9f9";
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

export { DnDEvent, Drag$1 as Drag, DragAwareMixin$1 as DragAwareMixin, DragImagesManager, DragMixin$1 as DragMixin, Drop$1 as Drop, DropList$1 as DropList, DropMask$1 as DropMask, DropMixin$1 as DropMixin, InsertEvent, ReorderEvent, createDragImage, dnd };
