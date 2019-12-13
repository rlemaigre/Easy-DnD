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
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits all
 * kinds of events during the progress of the drag and drop. It is a Vue instance, so its data is reactive and listeners
 * can be attachted to it using the method $on.
 */
var DnD = /*@__PURE__*/(function (Vue) {
    function DnD() {
        Vue.apply(this, arguments);
        this.inProgress = false;
        this.type = null;
        this.data = null;
        this.source = null;
        this.stack = null;
        this.position = null;
    }

    if ( Vue ) DnD.__proto__ = Vue;
    DnD.prototype = Object.create( Vue && Vue.prototype );
    DnD.prototype.constructor = DnD;
    DnD.prototype.startDrag = function startDrag (source, event, type, data) {
        var this$1 = this;

        this.type = type;
        this.data = data;
        this.source = source;
        this.stack = this.ancestors(this.source);
        this.position = {
            x: event.pageX,
            y: event.pageY
        };
        this.inProgress = true;
        Vue.nextTick(function () {
            this$1.$emit("dragstart");
            if (this$1.top() !== null && this$1.top()['isDrop']) {
                this$1.$emit('dragenter', {
                    from: null,
                    to: this$1.top()
                });
            }
            this$1.$emit('dragmove');
        });
    };
    DnD.prototype.stopDrag = function stopDrag () {
        if (this.top() !== null && this.top()['isDrop']) {
            this.$emit('dragleave');
        }
        this.$emit("dragend");
        this.inProgress = false;
        this.data = null;
        this.source = null;
        this.stack = null;
        this.position = null;
    };
    DnD.prototype.ancestors = function ancestors (comp) {
        var stack = [];
        if (comp.$parent) {
            stack.push.apply(stack, this.ancestors(comp.$parent));
        }
        if (comp['isDrop']) {
            if (comp['_acceptsType'](this.type)) {
                stack.push(comp);
            }
        }
        else if (comp['isDropMask']) {
            stack.push(comp);
        }
        return stack;
    };
    DnD.prototype.mouseEnter = function mouseEnter (enter) {
        var from = this.top();
        var to = enter;
        this.stack.push(enter);
        if (from) {
            this.$emit('dragleave', { from: from, to: to });
        }
        this.$emit('dragenter', { from: from, to: to });
    };
    DnD.prototype.mouseLeave = function mouseLeave (leave) {
        var from = leave;
        this.stack.pop();
        var to = this.top();
        this.$emit('dragleave', { from: from, to: to });
        if (to) {
            this.$emit('dragenter', { from: from, to: to });
        }
    };
    DnD.prototype.mouseMove = function mouseMove (event) {
        this.position = {
            x: event.clientX,
            y: event.clientY
        };
        this.$emit('dragmove');
    };
    DnD.prototype.top = function top () {
        return this.stack.length === 0 ? null : this.stack[this.stack.length - 1];
    };

    return DnD;
}(Vue));
var dnd = new DnD();

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
        return dnd.top();
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
    clone.style.transition = 'opacity 0.2s, transform 0.2s';
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

    var prototypeAccessors = { dragIn: { configurable: true },cssClasses: { configurable: true } };
    DragMixin.prototype.mounted = function mounted () {
        var comp = this;
        var el = this.$el;
        var dragStarted = false;
        var initialUserSelect;
        var mouseDownEvent = null;
        el.addEventListener('mousedown', onMouseDown);
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
        function onMouseDown(e) {
            initialUserSelect = document.body.style.userSelect;
            document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
            // quand on quitte un élémént avec overflow: hidden.
            dragStarted = false;
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDragging);
            document.addEventListener('selectstart', noop);
            mouseDownEvent = e;
        }
        function doDrag(e) {
            if (!dragStarted) {
                dragStarted = true;
                dnd.startDrag(comp, mouseDownEvent, comp.type, comp.data);
                document.documentElement.classList.add('drag-in-progress');
            }
            dnd.mouseMove(e);
        }
        function stopDragging(e) {
            if (dragStarted) {
                document.documentElement.classList.remove('drag-in-progress');
                dnd.stopDrag();
                e.stopPropagation();
                e.preventDefault();
            }
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDragging);
            document.removeEventListener('selectstart', noop);
            document.documentElement.style.userSelect = initialUserSelect;
        }
    };
    prototypeAccessors.dragIn.get = function () {
        return !this.dragInProgress && this.mouseIn;
    };
    prototypeAccessors.cssClasses.get = function () {
        return {
            'drag-in': this.dragIn,
            'drag-out': !this.dragIn
        };
    };
    DragMixin.prototype.createDragImage = function createDragImage$1 (selfTransform) {
        var image;
        if (this.$refs['drag-image']) {
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
DragMixin = __decorate([
    Component({})
], DragMixin);
var DragMixin$1 = DragMixin;

var Drag = /*@__PURE__*/(function (DragMixin) {
    function Drag () {
        DragMixin.apply(this, arguments);
    }

    if ( DragMixin ) Drag.__proto__ = DragMixin;
    Drag.prototype = Object.create( DragMixin && DragMixin.prototype );
    Drag.prototype.constructor = Drag;

    var prototypeAccessors = { showDragImage: { configurable: true } };

    prototypeAccessors.showDragImage.get = function () {
        return this.dragInProgress && this.$scopedSlots['drag-image'];
    };

    Object.defineProperties( Drag.prototype, prototypeAccessors );

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
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.cssClasses,style:({cursor: 'grab'}),scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),(_vm.showDragImage)?_c('div',{ref:"drag-image",staticClass:"__drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e()],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-956a4b28_0", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined })
,inject("data-v-956a4b28_1", { source: "html.drag-in-progress *{cursor:grabbing!important}", map: undefined, media: undefined })
,inject("data-v-956a4b28_2", { source: ".__drag-image[data-v-956a4b28]{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-956a4b28";
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
        DragAwareMixin.apply(this, arguments);
        this.isDrop = true;
    }

    if ( DragAwareMixin ) DropMixin.__proto__ = DragAwareMixin;
    DropMixin.prototype = Object.create( DragAwareMixin && DragAwareMixin.prototype );
    DropMixin.prototype.constructor = DropMixin;

    var prototypeAccessors = { dropIn: { configurable: true },typeAllowed: { configurable: true },dropAllowed: { configurable: true },cssClasses: { configurable: true },cssStyle: { configurable: true } };
    DropMixin.prototype._acceptsType = function _acceptsType (type) {
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
    DropMixin.prototype.overridableAcceptsType = function overridableAcceptsType (type) {
        return this._acceptsType(type);
    };
    DropMixin.prototype.overridableAcceptsData = function overridableAcceptsData (data, type) {
        return this.acceptsData(data, type);
    };
    DropMixin.prototype.created = function created () {
        dnd.$on("dragmove", this.onDragMove);
        dnd.$on("dragend", this.onDragEnd);
    };
    DropMixin.prototype.destroyed = function destroyed () {
        dnd.$off("dragmove", this.onDragMove);
        dnd.$off("dragend", this.onDragEnd);
    };
    DropMixin.prototype.onDragMove = function onDragMove () {
        if (this === this.dragTop) {
            this.$emit("dragover");
        }
    };
    DropMixin.prototype.onDragEnd = function onDragEnd () {
        if (this === this.dragTop) {
            this.$emit("drop");
        }
    };
    DropMixin.prototype.mounted = function mounted () {
        var el = this.$el;
        var comp = this;
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
        /**
         * The condition e.relatedTarget !== null is a fix for firefox triggering the mouseenter event several times. The
         * wrong events have a null relatedTarget in FF.
         */
        function onMouseEnter(e) {
            if (dnd.inProgress && comp.overridableAcceptsType(dnd.type) && e.relatedTarget !== null) {
                dnd.mouseEnter(comp);
            }
        }
        /**
         * The condition e.relatedTarget !== null is a fix for firefox triggering the mouseenter event several times. The
         * wrong events have a null relatedTarget in FF.
         */
        function onMouseLeave(e) {
            if (dnd.inProgress && comp.overridableAcceptsType(dnd.type) && e.relatedTarget !== null) {
                dnd.mouseLeave(comp);
            }
        }
        /* function onDrop(e) {
             if (dndimpl.inProgress && comp.overridableAcceptsType(dndimpl.type)) {
                 if (comp === dndimpl.top() && comp.compatibleModes() && comp.overridableAcceptsData(dndimpl.data, dndimpl.type)) {
                     comp.$emit('drop', new DnDEvent(dndimpl.type, dndimpl.data, e));
                     comp.$emit('dragleave', new DnDEvent(dndimpl.type, dndimpl.data, e));
                     if (!comp['reordering']) {
                         dndimpl.source.$emit(comp.mode, new DnDEvent(dndimpl.type, dndimpl.data, e));
                     }
                 }
             }
         }*/
    };
    DropMixin.prototype.compatibleModes = function compatibleModes () {
        return (this.mode === 'copy' || dnd.source.$listeners[this.mode]);
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
            return this._acceptsType(dnd.type);
        }
        else {
            return null;
        }
    };
    prototypeAccessors.dropAllowed.get = function () {
        if (this.dragInProgress) {
            if (this.typeAllowed) {
                return this['reordering'] || (this.compatibleModes() && this.overridableAcceptsData(dnd.data, dnd.type));
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
        var clazz = {};
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
DropMixin = __decorate([
    Component({})
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
        el.addEventListener('mouseenter', onDragEnter);
        el.addEventListener('mouseleave', onDragLeave);
        function onDragEnter(e) {
            if (this.dragInProgress) {
                dnd.mouseEnter(comp);
            }
        }
        function onDragLeave(e) {
            if (this.dragInProgress) {
                dnd.mouseLeave(comp);
            }
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

export { Drag$1 as Drag, DragAwareMixin$1 as DragAwareMixin, DragMixin$1 as DragMixin, Drop$1 as Drop, DropMask$1 as DropMask, DropMixin$1 as DropMixin, dnd };
