import { shallowReactive } from 'vue';
import mitt from 'mitt';

/**
 * Holds the reactive state of the active drag operation. Vue component
 * instances remain available through source/top for API compatibility, while
 * library internals operate exclusively on the raw controllers.
 */
export class DnD {

  inProgress = false;
  type = null;
  data = null;
  sourceController = null;
  topController = null;
  position = null;
  eventBus = mitt();
  success = null;

  get source () {
    return this.sourceController?.component ?? null;
  }

  get top () {
    return this.topController?.component ?? null;
  }

  startDrag (sourceController, event, x, y, type, data) {
    this.type = type;
    this.data = data;
    this.sourceController = sourceController;
    this.topController = null;
    this.position = { x, y };
    this.inProgress = true;
    this.emit(event, 'dragstart');
    this.emit(event, 'dragtopchanged', {
      previousTop: null,
      previousTopController: null
    });
  }

  resetVariables () {
    this.inProgress = false;
    this.type = null;
    this.data = null;
    this.sourceController = null;
    this.topController = null;
    this.position = null;
    this.success = null;
  }

  stopDrag (event) {
    this.success = this.topController !== null &&
      this.topController.getCompatibleMode() &&
      this.topController.getDropAllowed();
    if (this.topController !== null) {
      this.emit(event, 'drop');
    }
    this.emit(event, 'dragend');
    this.resetVariables();
  }

  cancelDrag (event) {
    this.success = false;
    this.emit(event, 'dragend');
    this.resetVariables();
  }

  clearTop (native = null) {
    if (this.topController === null) return;

    const previousTopController = this.topController;
    this.topController = null;
    this.emit(native, 'dragtopchanged', {
      previousTop: previousTopController.component,
      previousTopController
    });
  }

  mouseMove (event, controller) {
    if (!this.inProgress) return;

    let prevent = false;
    const previousTopController = this.topController;
    if (controller === null || controller.isDropMask) {
      this.topController = null;
      prevent = true;
    }
    else if (controller.candidate(this.type, this.data, this.sourceController)) {
      this.topController = controller;
      prevent = true;
    }

    if (prevent) event.stopPropagation();
    if (this.topController !== previousTopController) {
      this.emit(event.detail.native, 'dragtopchanged', {
        previousTop: previousTopController?.component ?? null,
        previousTopController
      });
    }
    this.position = {
      x: event.detail.x,
      y: event.detail.y
    };
    this.emit(event.detail.native, 'dragpositionchanged');
  }

  emit (native, event, data = {}) {
    this.eventBus.emit(event, {
      type: this.type,
      data: this.data,
      top: this.top,
      source: this.source,
      topController: this.topController,
      sourceController: this.sourceController,
      position: this.position,
      success: this.success,
      native,
      ...data
    });
  }

  on (event, callback) {
    this.eventBus.on(event, callback);
  }

  off (event, callback) {
    this.eventBus.off(event, callback);
  }
}

export const dnd = shallowReactive(new DnD());
