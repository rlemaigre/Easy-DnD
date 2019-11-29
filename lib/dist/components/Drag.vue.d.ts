import { Vue } from "vue-property-decorator";
export default class Drag extends Vue {
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
    readonly showDragImage: import("vue/types/vnode").NormalizedScopedSlot;
    readonly dndtype: string;
    readonly dnddata: any;
    readonly dragIn: boolean;
    readonly clazz: {
        'drag-in': boolean;
        'drag-out': boolean;
    };
}
