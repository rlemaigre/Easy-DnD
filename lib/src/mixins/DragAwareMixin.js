import { dnd } from "../js/DnD";

export default {
  computed: {
    dragInProgress () {
      return dnd.inProgress;
    },
    dragData () {
      return dnd.data;
    },
    dragType () {
      return dnd.type;
    },
    dragPosition () {
      return dnd.position;
    },
    dragSource () {
      return dnd.source;
    },
    dragTop () {
      return dnd.top;
    }
  }
};
