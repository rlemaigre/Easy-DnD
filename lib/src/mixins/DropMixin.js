import DragAwareMixin from './DragAwareMixin';
import { createDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';

export function dropAllowed (inst) {
  if (inst.dragInProgress && inst.typeAllowed) {
    return inst.compatibleMode && inst.effectiveAcceptsData(inst.dragData, inst.dragType);
  }
  return null;
}

export function doDrop (inst, event) {
  inst.$emit('drop', event);
  event.source.$emit(inst.mode, event);
}

export function candidate (inst, type) {
  return inst.effectiveAcceptsType(type);
}

export default {
  mixins: [DragAwareMixin],
  props: {
    acceptsType: {
      type: [String, Array, Function],
      default: null
    },
    acceptsData: {
      type: Function,
      default: () => {
        return true;
      }
    },
    mode: {
      type: String,
      default: 'copy'
    },
    dragImageOpacity: {
      type: Number,
      default: 0.7
    }
  },
  emits: ['dragover', 'dragenter', 'dragleave', 'dragend', 'drop'],
  data () {
    return {
      isDrop: true
    };
  },
  computed: {
    compatibleMode () {
      return this.dragInProgress ? true : null;
    },
    dropIn () {
      if (this.dragInProgress) {
        return this.dragTop === this;
      }
      return null;
    },
    typeAllowed () {
      if (this.dragInProgress) {
        return this.effectiveAcceptsType(this.dragType);
      }
      return null;
    },
    dropAllowed () {
      return dropAllowed(this);
    },
    cssClasses () {
      const clazz = {
        'dnd-drop': true
      };
      if (this.dropIn !== null) {
        clazz['drop-in'] = this.dropIn;
        clazz['drop-out'] = !this.dropIn;
      }
      if (this.typeAllowed !== null) {
        clazz['type-allowed'] = this.typeAllowed;
        clazz['type-forbidden'] = !this.typeAllowed;
      }
      if (this.dropAllowed !== null) {
        clazz['drop-allowed'] = this.dropAllowed;
        clazz['drop-forbidden'] = !this.dropAllowed;
      }
      return clazz;
    },
    cssStyle () {
      return {};
    }
  },
  methods: {
    effectiveAcceptsType (type) {
      if (this.acceptsType === null) {
        return true;
      }
      else if (typeof (this.acceptsType) === 'string' || typeof(this.acceptsType) === 'number') {
        return this.acceptsType === type;
      }
      else if (typeof (this.acceptsType) === 'object' && Array.isArray(this.acceptsType)) {
        return this.acceptsType.includes(type);
      }
      else {
        return this.acceptsType(type);
      }
    },
    effectiveAcceptsData (data, type) {
      return this.acceptsData(data, type);
    },
    onDragPositionChanged (event) {
      if (this === event.top) {
        this.$emit('dragover', event);
      }
    },
    onDragTopChanged (event) {
      if (this === event.top) {
        this.$emit('dragenter', event);
      }
      if (this === event.previousTop) {
        this.$emit('dragleave', event);
      }
    },
    onDragEnd (event) {
      if (this === event.top) {
        this.$emit('dragend', event);
      }
    },
    onDrop (event) {
      if (this.dropIn && this.compatibleMode && this.dropAllowed) {
        this.doDrop(event);
      }
    },
    doDrop (event) {
      doDrop(this, event);
    },
    /**
         * Returns true if the current drop area participates in the current drag operation.
         */
    candidate (type) {
      return candidate(this, type);
    },
    createDragImage () {
      let image = 'source';
      if (this.$refs['drag-image']) {
        const el = this.$refs['drag-image'];
        if (el.childElementCount !== 1) {
          image = createDragImage(el);
        }
        else {
          image = createDragImage(el.children.item(0));
        }
        image['__opacity'] = this.dragImageOpacity;
        image.classList.add('dnd-ghost');
      }
      return image;
    },
    onDnDMove (e) {
      dnd.mouseMove(e, this);
    }
  },
  created () {
    dnd.on('dragpositionchanged', this.onDragPositionChanged);
    dnd.on('dragtopchanged', this.onDragTopChanged);
    dnd.on('drop', this.onDrop);
    dnd.on('dragend', this.onDragEnd);
  },
  mounted () {
    this.$el.addEventListener('easy-dnd-move', this.onDnDMove);
  },
  beforeUnmount () {
    this.$el.removeEventListener('easy-dnd-move', this.onDnDMove);

    dnd.off('dragpositionchanged', this.onDragPositionChanged);
    dnd.off('dragtopchanged', this.onDragTopChanged);
    dnd.off('drop', this.onDrop);
    dnd.off('dragend', this.onDragEnd);
  }
};
