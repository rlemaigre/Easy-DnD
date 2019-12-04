import {Component, Vue} from "vue-property-decorator";
import {dndimpl} from "../ts/utils";

@Component({})
export default class DragAwareMixin extends Vue {

    get dragInProgress() {
        return dndimpl.inProgress;
    }

    get dragData() {
        return dndimpl.data;
    }

    get dragType() {
        return dndimpl.type;
    }

    get dragPosition() {
        return dndimpl.mousePosition;
    }

}