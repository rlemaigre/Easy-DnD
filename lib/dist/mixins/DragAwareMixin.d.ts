import { Vue } from "vue-property-decorator";
export default class DragAwareMixin extends Vue {
    readonly dragInProgress: boolean;
    readonly dragData: any;
    readonly dragType: string;
}
