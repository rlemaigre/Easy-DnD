import { Vue } from "vue-property-decorator";
export default class DragSensitive extends Vue {
    readonly dragInProgress: boolean;
    readonly dragData: any;
    readonly dragType: string;
}
