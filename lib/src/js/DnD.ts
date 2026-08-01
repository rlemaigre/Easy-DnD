import { shallowReactive } from 'vue';
import mitt from 'mitt';
import type {
  DnDComponent,
  DnDEventMap,
  DnDEventName,
  DnDEventPayload,
  DnDNativeEvent,
  DragController,
  DragData,
  DragType,
  DropController,
  DropTargetController,
  EasyDnDMoveEvent,
  Point
} from '../types';

/**
 * Holds the reactive state of the active drag operation. Vue component
 * instances remain available through source/top for API compatibility, while
 * library internals operate exclusively on the raw controllers.
 */
export class DnD {

  inProgress = false;
  type: DragType = null;
  data: DragData = null;
  sourceController: DragController | null = null;
  topController: DropController | null = null;
  position: Point | null = null;
  eventBus = mitt<DnDEventMap>();
  success: boolean | null = null;

  get source (): DnDComponent {
    return this.sourceController?.component ?? null;
  }

  get top (): DnDComponent {
    return this.topController?.component ?? null;
  }

  startDrag (
    sourceController: DragController,
    event: Event,
    x: number,
    y: number,
    type: DragType,
    data: DragData
  ) {
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

  stopDrag (event: Event) {
    this.success = !!(this.topController !== null &&
      this.topController.getCompatibleMode() &&
      this.topController.getDropAllowed());
    if (this.topController !== null) {
      this.emit(event, 'drop');
    }
    this.emit(event, 'dragend');
    this.resetVariables();
  }

  cancelDrag (event: DnDNativeEvent) {
    this.success = false;
    this.emit(event, 'dragend');
    this.resetVariables();
  }

  clearTop (native: DnDNativeEvent = null) {
    if (this.topController === null) return;

    const previousTopController = this.topController;
    this.topController = null;
    this.emit(native, 'dragtopchanged', {
      previousTop: previousTopController.component,
      previousTopController
    });
  }

  mouseMove (event: EasyDnDMoveEvent, controller: DropTargetController | null) {
    if (!this.inProgress) return;

    let prevent = false;
    const previousTopController = this.topController;
    if (controller === null) {
      this.topController = null;
      prevent = true;
    }
    else if (!('candidate' in controller)) {
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

  emit (
    native: DnDNativeEvent,
    event: DnDEventName,
    data: Partial<DnDEventPayload> = {}
  ) {
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

  on<K extends DnDEventName> (event: K, callback: (payload: DnDEventMap[K]) => void) {
    this.eventBus.on(event, callback);
  }

  off<K extends DnDEventName> (event: K, callback: (payload: DnDEventMap[K]) => void) {
    this.eventBus.off(event, callback);
  }
}

export const dnd = shallowReactive(new DnD());
