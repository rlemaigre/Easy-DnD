import { Vue } from 'vue-property-decorator';
import { NormalizedScopedSlot } from 'vue/types/vnode';

declare class DragMixin extends Vue {
    isDrag: boolean;
    type: string;
    data: any;
    mouseIn: boolean;
    mounted(): void;
    readonly dragIn: boolean;
}

declare class Drag extends DragMixin {
    /**
     * Tag to be used as root of this component. Defaults to div.
     */
    tag: string | object;
    readonly showDragImage: NormalizedScopedSlot;
    readonly dndtype: string;
    readonly dnddata: any;
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
declare class DnDEvent {
    type: any;
    data: any;
    mouse: MouseEvent;
    constructor(type: any, data: any, mouse: MouseEvent);
}
declare let dnd: DragState;

declare class DragAwareMixin extends Vue {
    readonly dragInProgress: boolean;
    readonly dragData: any;
    readonly dragType: string;
}

export { DnDEvent, Drag, DragAwareMixin, DragMixin, DragState, Drop, DropMask, dnd };
