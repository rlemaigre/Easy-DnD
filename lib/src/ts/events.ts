import {Vue} from "vue-property-decorator";

export class DnDEvent {

    type: any;
    data: any;
    top: Vue;
    previousTop: Vue;
    source: Vue;
    position: { x, y };
    success: Boolean;
    native: TouchEvent | MouseEvent;

}

export class ReorderEvent {

    constructor(
        public from: number,
        public to: number
    ) {
    }

    apply(array: any[]) {
        let tmp = array[this.from];
        array.splice(this.from, 1);
        array.splice(this.to, 0, tmp);
    }

}

export class InsertEvent {

    constructor(
        public type: any,
        public data: any,
        public index: number
    ) {
    }

}