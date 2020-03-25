import DropMixin from "../mixins/DropMixin";
export default class Drop extends DropMixin {
    tag: string | object;
    readonly showDragImage: import("vue/types/vnode").NormalizedScopedSlot;
}
