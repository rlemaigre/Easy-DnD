import {Vue} from "vue-property-decorator";

export class DnDEvent {

    type: any;
    data: any;
    top: Vue;
    previousTop: Vue;
    source: Vue;
    position: { x, y };

}

export class ReorderEvent {

    from: number;
    to: number;

}

export class InsertEvent {

    type: any;
    data: any;
    index: number;

}