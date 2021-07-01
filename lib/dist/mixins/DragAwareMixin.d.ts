import { Vue } from "vue-property-decorator";
export default class DragAwareMixin extends Vue {
    get dragInProgress(): boolean;
    get dragData(): any;
    get dragType(): any;
    get dragPosition(): {
        x: number;
        y: number;
    };
    get dragSource(): Vue;
    get dragTop(): Vue;
}
