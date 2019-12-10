import { Vue } from "vue-property-decorator";
export default class DropMask extends Vue {
    isDropMask: boolean;
    tag: any;
    mounted(): void;
    createDragImage(): string;
}
