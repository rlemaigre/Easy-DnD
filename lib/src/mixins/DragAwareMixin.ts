import {Component, Vue} from "vue-property-decorator";
import {dnd} from "../ts/utils";

@Component({})
export default class DragAwareMixin extends Vue {

    get dragInProgress() {
        return dnd.inProgress;
    }

    get dragData() {
        return dnd.data;
    }

    get dragType() {
        return dnd.type;
    }

}