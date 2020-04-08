import {Component, Vue} from "vue-property-decorator";
import {dnd} from "../ts/DnD";

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

    get dragPosition() {
        return dnd.position;
    }

    get dragSource() {
        return dnd.source;
    }

    get dragTop() {
        return dnd.top;
    }

}