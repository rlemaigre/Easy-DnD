import {Vue} from "vue-property-decorator";

/**
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits all
 * kinds of events during the progress of the drag and drop. It is a Vue instance, so its data is reactive and listeners
 * can be attachted to it using the method $on.
 */
export class DnD extends Vue {

    public inProgress = false;
    public type: any = null;
    public data: any = null;
    public source: Vue = null;
    public stack: Vue[] = null;
    public position: { x: number, y: number } = null;

    public startDrag(source: Vue, event: MouseEvent, type, data) {
        this.type = type;
        this.data = data;
        this.source = source;
        this.stack = this.ancestors(this.source);
        this.position = {
            x: event.pageX,
            y: event.pageY
        };
        this.inProgress = true;
        Vue.nextTick(() => {
            this.$emit("dragstart");
            if (this.top() !== null && this.top()['isDrop']) {
                this.$emit('dragenter', {
                    from: null,
                    to: this.top()
                });
            }
            this.$emit('dragmove');
        });
    }

    public stopDrag() {
        if (this.top() !== null && this.top()['isDrop']) {
            this.$emit('dragleave');
        }
        this.$emit("dragend");
        this.inProgress = false;
        this.data = null;
        this.source = null;
        this.stack = null;
        this.position = null;
    }

    protected ancestors(comp: Vue) {
        let stack = [];
        if (comp.$parent) {
            stack.push(...this.ancestors(comp.$parent));
        }
        if (comp['isDrop']) {
            if (comp['_acceptsType'](this.type)) {
                stack.push(comp);
            }
        } else if (comp['isDropMask']) {
            stack.push(comp);
        }
        return stack;
    }

    public mouseEnter(enter: Vue) {
        let from = this.top();
        let to = enter;
        this.stack.push(enter);
        if (from) {
            this.$emit('dragleave', {from, to});
        }
        this.$emit('dragenter', {from, to});
    }

    public mouseLeave(leave: Vue) {
        let from = leave;
        this.stack.pop();
        let to = this.top();
        this.$emit('dragleave', {from, to});
        if (to) {
            this.$emit('dragenter', {from, to});
        }
    }

    public mouseMove(event) {
        this.position = {
            x: event.clientX,
            y: event.clientY
        };
        this.$emit('dragmove');
    }

    public top() {
        return this.stack.length === 0 ? null : this.stack[this.stack.length - 1];
    }

}