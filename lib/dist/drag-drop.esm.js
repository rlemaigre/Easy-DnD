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

var minScale = "0.5";
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
 * Clones the given element and all its descendants in a way that the computed styles of the clones are the same as the
 * computed styles of the originals whatever the location in the DOM the clones are injected. Returns the root of the clone.
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
function changeScale(element, newScale) {
    if (element.style.transform !== 'none') {
        if (element.style.transform.includes('scale')) {
            element.style.transform = element.style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(' + newScale + ')');
        }
        else {
            element.style.transform = element.style.transform + ' scale(' + newScale + ')';
        }
    }
    else {
        element.style.transform = 'scale(' + newScale + ')';
    }
}
var DnDEvent = function DnDEvent(type, data, mouse) {
    this.type = type;
    this.data = data;
    this.mouse = mouse;
};
var DragStateImpl = function DragStateImpl() {
    this.inProgress = false;
    this.type = null;
    this.data = null;
    this.feedback = null;
    this.source = null;
    this.stack = null;
    this.clones = null;
    this.selfTransform = null;
};
/**
 * Appelée lors du début du drag avec en paramètre le composant Drag dont le drag part.
 */
DragStateImpl.prototype.init = function init (source, event) {
        var this$1 = this;

    var startPos = {
        x: event.pageX,
        y: event.pageY
    };
    var sourcePos = {
        x: source.$el.getBoundingClientRect().left,
        y: source.$el.getBoundingClientRect().top
    };
    this.selfTransform = "translate(-" + (startPos.x - sourcePos.x) + "px, -" + (startPos.y - sourcePos.y) + "px)";
    this.source = source;
    this.stack = this.ancestors(this.source);
    this.clones = new Map();
    this.inProgress = true;
    Vue.nextTick(function () { return this$1.updateClonesVisibility(); });
};
DragStateImpl.prototype.ancestors = function ancestors (comp) {
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
/**
 * Appelée en fin de drag après le drop.
 */
DragStateImpl.prototype.clear = function clear () {
    this.inProgress = false;
    this.data = null;
    this.source = null;
    this.stack = null;
    this.clones.forEach(function (clone) {
        clone.remove();
    });
    this.clones = null;
};
DragStateImpl.prototype.getSourceModel = function getSourceModel () {
    if (this.source.$refs['drag-image']) {
        var el = this.source.$refs['drag-image'];
        if (el.childElementCount !== 1)
            { return el; }
        else
            { return el.children.item(0); }
    }
    else {
        return this.source.$el;
    }
};
/**
 * Retourne l'élément modèle de l'image de drag courante.
 */
DragStateImpl.prototype.getModel = function getModel () {
    var top = this.top();
    if (top === null || top['isDropMask']) {
        return this.getSourceModel();
    }
    else {
        if (top.$refs['drag-image']) {
            var el = top.$refs['drag-image'];
            if (el.childElementCount > 1)
                { return el; }
            else
                { return el.children.item(0); }
        }
        else {
            return this.getSourceModel();
        }
    }
};
DragStateImpl.prototype.getSourceTransform = function getSourceTransform () {
        var this$1 = this;

    if (this.source.$refs['drag-image']) {
        return function () {
        };
    }
    else {
        return function (clone) {
            clone.style.transform = this$1.selfTransform;
        };
    }
};
/**
 * Retourne la transformation à appliquer à l'image de drag courante.
 */
DragStateImpl.prototype.getTransform = function getTransform () {
    var top = this.top();
    if (top === null || top['isDropMask']) {
        return this.getSourceTransform();
    }
    else {
        if (top.$scopedSlots['drag-image']) {
            return function () {
            };
        }
        else {
            return this.getSourceTransform();
        }
    }
};
/**
 * Appelée sur le mouseenter d'un composant Drop.
 */
DragStateImpl.prototype.mouseEnter = function mouseEnter (enter, event) {
    // Drag leave de la zone précédente :
    if (this.stack.length > 0) {
        var leave = this.stack[this.stack.length - 1];
        leave.$emit('dragleave', new DnDEvent(this.type, this.data, event));
    }
    // Drag enter dans la nouvelle zone :
    enter.$emit('dragenter', new DnDEvent(this.type, this.data, event));
    // Mise à jour de la pile :
    this.stack.push(enter);
    // Mise à jour des clones en fonction de l'état courant :
    this.updateClonesVisibility();
};
/**
 * Appelée sur le mouseleave d'un composant Drop.
 */
DragStateImpl.prototype.mouseLeave = function mouseLeave (event) {
    // Drag leave de la zone précédente :
    var leave = this.stack[this.stack.length - 1];
    leave.$emit('dragleave', new DnDEvent(this.type, this.data, event));
    // Mise à jour de la pile :
    this.stack.pop();
    // Drag enter dans la nouvelle zone :
    if (this.stack.length > 0) {
        var enter = this.stack[this.stack.length - 1];
        enter.$emit('dragenter', new DnDEvent(this.type, this.data, event));
    }
    // Mise à jour de la visibilité des clones en fonction de l'état courant :
    this.updateClonesVisibility();
};
/**
 * Met à jour les clones en fonction de l'état courant.
 */
DragStateImpl.prototype.updateClonesVisibility = function updateClonesVisibility () {
    // On met tous les clones en visibilité nulle, taille minimale :
    this.clones.forEach(function (clone) {
        clone.style.opacity = "0";
        changeScale(clone, minScale);
    });
    // On met le clone actif en visibilité maximale, taille maximale :
    var clone = this.getActiveClone();
    if (clone !== null) {
        // Important. This forces a browser reflow, so the transition on opacity is triggered
        // when the clone enters the DOM :
        clone.offsetWidth;
        clone.style.opacity = "0.7";
        changeScale(clone, 1);
    }
};
/**
 * Retourne le clone actif en fonction de l'état courant.
 */
DragStateImpl.prototype.getActiveClone = function getActiveClone () {
    var model = this.getModel();
    var transform = this.getTransform();
    if (model !== null) {
        if (!this.clones.has(model)) {
            var clone;
            if (model.parentElement) {
                clone = createDragImage(model);
            }
            else {
                clone = model;
            }
            transform(clone);
            clone.style.opacity = '0';
            changeScale(clone, minScale);
            document.body.append(clone);
            this.clones.set(model, clone);
        }
        return this.clones.get(model);
    }
    else {
        return null;
    }
};
/**
 * Retourne le composant Drop le plus à l'avant plan sous la souris ou null s'il n'y en a pas.
 */
DragStateImpl.prototype.top = function top () {
    return this.stack.length === 0 ? null : this.stack[this.stack.length - 1];
};
/**
 * Moves all the clones to the position of the mouse pointer.
 */
DragStateImpl.prototype.move = function move (event) {
    this.clones.forEach(function (clone) {
        clone.style.left = event.pageX + "px";
        clone.style.top = event.pageY + "px";
    });
};
var dndimpl = new DragStateImpl();
dndimpl = Vue.observable(dndimpl);
var dnd = dndimpl;

var DragAwareMixin = /*@__PURE__*/(function (Vue) {
    function DragAwareMixin () {
        Vue.apply(this, arguments);
    }

    if ( Vue ) DragAwareMixin.__proto__ = Vue;
    DragAwareMixin.prototype = Object.create( Vue && Vue.prototype );
    DragAwareMixin.prototype.constructor = DragAwareMixin;

    var prototypeAccessors = { dragInProgress: { configurable: true },dragData: { configurable: true },dragType: { configurable: true } };

    prototypeAccessors.dragInProgress.get = function () {
        return dnd.inProgress;
    };
    prototypeAccessors.dragData.get = function () {
        return dnd.data;
    };
    prototypeAccessors.dragType.get = function () {
        return dnd.type;
    };

    Object.defineProperties( DragAwareMixin.prototype, prototypeAccessors );

    return DragAwareMixin;
}(Vue));
DragAwareMixin = __decorate([
    Component({})
], DragAwareMixin);
var DragAwareMixin$1 = DragAwareMixin;

var DragMixin = /*@__PURE__*/(function (DragAwareMixin) {
    function DragMixin() {
        DragAwareMixin.apply(this, arguments);
        this.isDrag = true;
        this.mouseIn = null;
    }

    if ( DragAwareMixin ) DragMixin.__proto__ = DragAwareMixin;
    DragMixin.prototype = Object.create( DragAwareMixin && DragAwareMixin.prototype );
    DragMixin.prototype.constructor = DragMixin;

    var prototypeAccessors = { dragIn: { configurable: true } };
    DragMixin.prototype.mounted = function mounted () {
        var comp = this;
        var el = this.$el;
        var dragStarted = false;
        var initialUserSelect;
        el.addEventListener('mousedown', startDragging);
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
        function startDragging(e) {
            initialUserSelect = document.body.style.userSelect;
            document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
            // quand on quitte un élémént avec overflow: hidden.
            dragStarted = false;
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDragging);
            document.addEventListener('selectstart', noop);
        }
        function doDrag(e) {
            if (!dragStarted) {
                dragStarted = true;
                dndimpl.type = comp.type;
                dndimpl.data = comp.data;
                comp.$emit('dragstart', new DnDEvent(dndimpl.type, dndimpl.data, e));
                dndimpl.init(comp, e);
                document.documentElement.classList.add('drag-in-progress');
            }
            comp.$emit('drag', e);
            dndimpl.move(e);
        }
        function stopDragging(e) {
            if (dragStarted) {
                comp.$emit('dragend', new DnDEvent(dndimpl.type, dndimpl.data, e));
                document.documentElement.classList.remove('drag-in-progress');
                dndimpl.clear();
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
        return !dndimpl.inProgress && this.mouseIn;
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

    var prototypeAccessors = { showDragImage: { configurable: true },clazz: { configurable: true } };

    prototypeAccessors.showDragImage.get = function () {
        return this.dragInProgress && this.$scopedSlots['drag-image'];
    };
    prototypeAccessors.clazz.get = function () {
        return {
            'drag-in': this.dragIn,
            'drag-out': !this.dragIn
        };
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
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.clazz,style:({cursor: 'grab'}),scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),(_vm.showDragImage)?_c('div',{ref:"drag-image",staticClass:"drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e()],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-50d7c142_0", { source: "", map: undefined, media: undefined })
,inject("data-v-50d7c142_1", { source: "html.drag-in-progress *{cursor:grabbing!important}.drag-image{position:fixed;top:-10000px;left:-10000px;will-change:left,top}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-50d7c142";
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

    var prototypeAccessors = { dropIn: { configurable: true },typeAllowed: { configurable: true },dropAllowed: { configurable: true },dropReady: { configurable: true } };
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
    DropMixin.prototype.mounted = function mounted () {
        var el = this.$el;
        var comp = this;
        el.addEventListener('mouseenter', onDragEnter);
        el.addEventListener('mouseleave', onDragLeave);
        el.addEventListener('mousemove', onDragOver);
        el.addEventListener('mouseup', onDrop);
        function onDragEnter(e) {
            if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                dndimpl.mouseEnter(comp, e);
            }
        }
        function onDragLeave(e) {
            if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                dndimpl.mouseLeave(e);
            }
        }
        function onDragOver(e) {
            if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                comp.$emit('dragover', new DnDEvent(dndimpl.type, dndimpl.data, e));
            }
        }
        function onDrop(e) {
            if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                if (comp === dndimpl.top() && comp.compatibleModes() && comp.acceptsData(dndimpl.data, dndimpl.type)) {
                    comp.$emit('drop', new DnDEvent(dndimpl.type, dndimpl.data, e));
                    dndimpl.source.$emit(comp.mode, new DnDEvent(dndimpl.type, dndimpl.data, e));
                }
            }
        }
    };
    DropMixin.prototype.compatibleModes = function compatibleModes () {
        return (this.mode === 'copy' || dndimpl.source.$listeners[this.mode]);
    };
    prototypeAccessors.dropIn.get = function () {
        if (dndimpl.inProgress) {
            return dndimpl.top() === this;
        }
        else {
            return null;
        }
    };
    prototypeAccessors.typeAllowed.get = function () {
        if (dndimpl.inProgress) {
            return this._acceptsType(dndimpl.type);
        }
        else {
            return null;
        }
    };
    prototypeAccessors.dropAllowed.get = function () {
        if (dndimpl.inProgress) {
            if (this.typeAllowed) {
                return this.compatibleModes() && this.acceptsData(dndimpl.data, dndimpl.type);
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };
    prototypeAccessors.dropReady.get = function () {
        return dndimpl.inProgress && this._acceptsType(dndimpl.type) && this.compatibleModes() && this.acceptsData(dndimpl.data, dndimpl.type) && dndimpl.top() === this;
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

    var prototypeAccessors = { clazz: { configurable: true },style: { configurable: true },showDragImage: { configurable: true } };

    prototypeAccessors.clazz.get = function () {
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
    prototypeAccessors.style.get = function () {
        if (this.dropReady) {
            return { cursor: this.cursor + ' !important' };
        }
        else {
            return { cursor: 'inherit' };
        }
    };
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
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.tag,_vm._g(_vm._b({tag:"component",class:_vm.clazz,style:(_vm.style),scopedSlots:_vm._u([_vm._l((_vm.$scopedSlots),function(_,slot){return {key:slot,fn:function(scope){return [_vm._t(slot,null,null,scope)]}}})],null,true)},'component',_vm.$attrs,false),_vm.$listeners),[_vm._t("default"),_vm._v(" "),_vm._v(" "),(_vm.showDragImage)?_c('div',{ref:"drag-image",staticClass:"drag-image"},[_vm._t("drag-image",null,{"type":_vm.dragType,"data":_vm.dragData})],2):_vm._e()],2)};
var __vue_staticRenderFns__$1 = [];

  /* style */
  var __vue_inject_styles__$1 = function (inject) {
    if (!inject) { return }
    inject("data-v-31b15154_0", { source: ".drop-allowed.drop-in *{cursor:inherit!important}.drop-forbidden.drop-in,.drop-forbidden.drop-in *{cursor:no-drop!important}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__$1 = undefined;
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

var DropMask = /*@__PURE__*/(function (Vue) {
    function DropMask() {
        Vue.apply(this, arguments);
        this.isDropMask = true;
    }

    if ( Vue ) DropMask.__proto__ = Vue;
    DropMask.prototype = Object.create( Vue && Vue.prototype );
    DropMask.prototype.constructor = DropMask;
    DropMask.prototype.mounted = function mounted () {
        var el = this.$el;
        var comp = this;
        el.addEventListener('mouseenter', onDragEnter);
        el.addEventListener('mouseleave', onDragLeave);
        function onDragEnter(e) {
            if (dndimpl.inProgress) {
                dndimpl.mouseEnter(comp, e);
            }
        }
        function onDragLeave(e) {
            if (dndimpl.inProgress) {
                dndimpl.mouseLeave(e);
            }
        }
    };

    return DropMask;
}(Vue));
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

export { DnDEvent, Drag$1 as Drag, DragAwareMixin$1 as DragAwareMixin, DragMixin$1 as DragMixin, Drop$1 as Drop, DropMask$1 as DropMask, DropMixin$1 as DropMixin, dnd };
