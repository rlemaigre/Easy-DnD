import { shallowReactive } from 'vue';
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

type DnDHandler = (payload: DnDEventPayload) => void;
type DnDWildcardHandler = (event: DnDEventName, payload: DnDEventPayload) => void;

class DnDEventBus {
  all = new Map<DnDEventName | '*', Set<DnDHandler | DnDWildcardHandler>>();

  on (event: DnDEventName | '*', callback: DnDHandler | DnDWildcardHandler) {
    let handlers = this.all.get(event);
    if (!handlers) this.all.set(event, handlers = new Set());
    handlers.add(callback);
  }

  off (event: DnDEventName | '*', callback: DnDHandler | DnDWildcardHandler) {
    this.all.get(event)?.delete(callback);
  }

  emit (event: DnDEventName, payload: DnDEventPayload) {
    this.all.get(event)?.forEach(handler => (handler as DnDHandler)(payload));
    this.all.get('*')?.forEach(handler => (handler as DnDWildcardHandler)(event, payload));
  }
}

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
  eventBus = new DnDEventBus();
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
    try {
      this.emit(event, 'dragstart');
      this.emit(event, 'dragtopchanged', {
        previousTop: null,
        previousTopController: null
      });
    }
    catch (error) {
      this.success = false;
      try {
        this.emit(event, 'dragend');
      }
      finally {
        this.resetVariables();
      }
      throw error;
    }
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
    let failure: unknown;
    try {
      if (this.topController !== null) {
        this.emit(event, 'drop');
      }
    }
    catch (error) {
      failure = error;
    }
    try {
      this.emit(event, 'dragend');
    }
    catch (error) {
      failure ??= error;
    }
    finally {
      this.resetVariables();
    }
    if (failure) throw failure;
  }

  cancelDrag (event: DnDNativeEvent) {
    this.success = false;
    try {
      this.emit(event, 'dragend');
    }
    finally {
      this.resetVariables();
    }
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

    const previousTopController = this.topController;
    if (controller === null) {
      this.topController = null;
    }
    else if (!('candidate' in controller)) {
      this.topController = null;
    }
    else if (controller.candidate(this.type, this.data, this.sourceController)) {
      this.topController = controller;
    }
    else {
      // Let the event bubble to a compatible ancestor. The accepting target (or
      // the document fallback) owns the single position update for this move.
      return;
    }

    event.stopPropagation();
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
    const payload: DnDEventPayload = {
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
    };

    let failure: unknown;
    try {
      this.notifyControllers(event, payload);
    }
    catch (error) {
      failure = error;
    }
    try {
      this.eventBus.emit(event, payload);
    }
    catch (error) {
      failure ??= error;
    }
    if (failure) throw failure;
  }

  private notifyControllers (event: DnDEventName, payload: DnDEventPayload) {
    if (event === 'dragstart') {
      payload.sourceController?.notifyDragStart?.(payload);
    }
    else if (event === 'dragpositionchanged') {
      payload.topController?.notifyDragPosition?.(payload);
    }
    else if (event === 'dragtopchanged') {
      payload.topController?.notifyDragTopChanged?.(payload);
      if (payload.previousTopController !== payload.topController) {
        payload.previousTopController?.notifyDragTopChanged?.(payload);
      }
    }
    else if (event === 'drop') {
      payload.topController?.notifyDrop?.(payload);
    }
    else if (event === 'dragend') {
      payload.topController?.notifyDragEnd?.(payload);
      payload.sourceController?.notifyDragEnd?.(payload);
    }
  }

  on<K extends DnDEventName> (event: K, callback: (payload: DnDEventMap[K]) => void) {
    this.eventBus.on(event, callback);
  }

  off<K extends DnDEventName> (event: K, callback: (payload: DnDEventMap[K]) => void) {
    this.eventBus.off(event, callback);
  }
}

export const dnd = shallowReactive(new DnD());
