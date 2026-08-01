import type {
  DnDComponent,
  DnDNativeEvent,
  DragData,
  DragType,
  Point
} from '../types';

export class DnDEvent {
    type: DragType = null;
    data: DragData = null;
    top: DnDComponent = null;
    previousTop: DnDComponent = null;
    source: DnDComponent = null;
    position: Point | null = null;
    success: boolean | null = null;
    native: DnDNativeEvent = null;
}

export class ReorderEvent {
    from: number;
    to: number;

    constructor (from: number, to: number) {
      this.from = from;
      this.to = to;
    }

    apply<T> (array: T[]) {
      const temp = array[this.from];
      array.splice(this.from, 1);
      array.splice(this.to, 0, temp);
    }

}

export class InsertEvent {
    type: DragType;
    data: DragData;
    index: number;

    constructor (type: DragType, data: DragData, index: number) {
      this.type = type;
      this.data = data;
      this.index = index;
    }
}
