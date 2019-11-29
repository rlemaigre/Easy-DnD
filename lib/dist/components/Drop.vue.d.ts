import { Vue } from "vue-property-decorator";
export default class Drop extends Vue {
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
    readonly showDragImage: import("vue/types/vnode").NormalizedScopedSlot;
    readonly dndtype: string;
    readonly dnddata: any;
}
