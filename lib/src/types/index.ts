import type { ComponentPublicInstance, Ref } from 'vue';

export type DragType = string | number | null;
export type DragData = unknown;
export type DropMode = string;
export type DnDNativeEvent = Event | null;
export type DnDComponent = ComponentPublicInstance | Record<string, unknown> | null;

export interface Point {
  x: number;
  y: number;
}

export interface DragImageElement extends HTMLElement {
  __opacity?: number;
}

export type DragImage = DragImageElement | 'source' | null;

export interface DragController {
  readonly component: DnDComponent;
  getElement(): HTMLElement;
  getGoBack(): boolean;
  createDragImage(selfTransform: string | null): DragImageElement;
  notifyDrop(mode: DropMode, event: DnDEventPayload): void;
  notifyDragStart?(event: DnDEventPayload): void;
  notifyDragEnd?(event: DnDEventPayload): void;
}

export interface DropController {
  readonly component: DnDComponent;
  readonly isDropMask: false;
  getElement(): HTMLElement;
  getMode(): DropMode;
  getScrollingEdgeSize(): number | undefined;
  getScrollingPropagation?(): boolean | undefined;
  getCompatibleMode(): boolean | null;
  getDropAllowed(): boolean | null;
  getReordering(): boolean;
  candidate(type: DragType, data: DragData, source: DragController | null): boolean;
  createDragImage(selfTransform?: string | null): DragImage;
  notifyDragPosition?(event: DnDEventPayload): void;
  notifyDragTopChanged?(event: DnDEventPayload): void;
  notifyDrop?(event: DnDEventPayload): void;
  notifyDragEnd?(event: DnDEventPayload): void;
}

export interface DropMaskController {
  readonly component: DnDComponent;
  readonly isDropMask: true;
  getElement(): HTMLElement;
}

export type DropTargetController = DropController | DropMaskController;

export interface EasyDnDMoveDetail {
  x: number;
  y: number;
  native: Event;
}

export type EasyDnDMoveEvent = CustomEvent<EasyDnDMoveDetail>;

export interface DnDEventPayload {
  type: DragType;
  data: DragData;
  top: DnDComponent;
  previousTop?: DnDComponent;
  source: DnDComponent;
  topController: DropController | null;
  previousTopController?: DropController | null;
  sourceController: DragController | null;
  position: Point | null;
  success: boolean | null;
  native: DnDNativeEvent;
}

export type DnDEventName =
  | 'dragstart'
  | 'dragtopchanged'
  | 'dragpositionchanged'
  | 'drop'
  | 'dragend';

export type DnDEventMap = Record<DnDEventName, DnDEventPayload>;
export type DnDEmit = (event: string, payload: unknown) => void;

export interface ElementRefs {
  rootElement: Ref<HTMLElement | null>;
  dragImageElement?: Ref<HTMLElement | null>;
}
