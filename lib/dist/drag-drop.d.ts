import { Vue } from 'vue-property-decorator';
import { NormalizedScopedSlot } from 'vue/types/vnode';

declare class Drag extends Vue {
    isDrag: boolean;
    /**
     * Tag to be used as root of this component. Defaults to div.
     */
    tag: string | object;
    type: string;
    data: any;
    mouseIn: boolean;
    onMouseEnter(): void;
    onMouseLeave(): void;
    mounted(): void;
    readonly showDragImage: NormalizedScopedSlot;
    readonly dndtype: string;
    readonly dnddata: any;
    readonly dragIn: boolean;
    readonly clazz: {
        'drag-in': boolean;
        'drag-out': boolean;
    };
}

declare class Drop extends Vue {
    isDrop: boolean;
    tag: string | object;
    acceptsType: string | string[] | {
        (type: any): boolean;
    };
    acceptsData: {
        (data: any, type: string): boolean;
    };
    cursor: string;
    mode: string;
    _acceptsType(type: string): boolean;
    mounted(): void;
    compatibleModes(): true | Function | Function[];
    readonly clazz: {};
    readonly style: {
        cursor: string;
    };
    readonly showDragImage: NormalizedScopedSlot;
    readonly dndtype: string;
    readonly dnddata: any;
}

declare class DropMask extends Vue {
    isDropMask: boolean;
    tag: any;
    mounted(): void;
}

interface DragState {
    inProgress: boolean;
    type: string;
    data: any;
}
declare class DNDEvent {
    type: any;
    data: any;
    mouse: MouseEvent;
    constructor(type: any, data: any, mouse: MouseEvent);
}
declare let dnd: DragState;

declare class DragSensitive extends Vue {
    readonly dragInProgress: boolean;
    readonly dragData: any;
    readonly dragType: string;
}

export { DNDEvent, Drag, DragSensitive, DragState, Drop, DropMask, dnd };
