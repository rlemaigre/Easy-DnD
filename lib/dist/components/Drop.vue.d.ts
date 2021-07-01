import DropMixin from "../mixins/DropMixin";
export default class Drop extends DropMixin {
    tag: any;
    get showDragImage(): import("vue/types/vnode").NormalizedScopedSlot;
}
