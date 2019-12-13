import {Vue} from "vue-property-decorator";
import {dnd} from "./DnD";

/**
 * This class reacts to drag events emitted by the dnd object to manage a sequence of drag images and fade from one to the
 * other as the drag progresses.
 */
export class DragImagesManager extends Vue {

    selfTransform: string = null;
    clones: Map<Vue, HTMLElement> = null;
    source: Vue = null;
    sourceClone: HTMLElement = null;

    constructor() {
        super();
        dnd.on('dragstart', (event) => this.onDragStart(event));
        dnd.on('dragtopchanged', (event) => this.onDragTopChanged(event));
        dnd.on('dragpositionchanged', (event) => this.onDragPositionChanged(event));
        dnd.on('dragend', (event) => this.onDragEnd(event));
    }

    onDragStart(event) {
        let sourcePos = {
            x: event.source.$el.getBoundingClientRect().left,
            y: event.source.$el.getBoundingClientRect().top
        };
        this.selfTransform = "translate(-" + (event.position.x - sourcePos.x) + "px, -" + (event.position.y - sourcePos.y) + "px)";
        this.clones = new Map<Vue, HTMLElement>();
        this.source = event.source;
    }

    onDragEnd(event) {
        this.clones.forEach((clone) => {
            clone.remove();
        });
        if (this.sourceClone !== null) {
            this.sourceClone.remove();
        }
        this.selfTransform = null;
        this.clones = null;
        this.source = null;
        this.sourceClone = null;
    }

    onDragTopChanged(event) {
        let top = event.top;

        this.clones.forEach(clone => {
            clone.style.opacity = "0";
        });
        if (this.sourceClone) {
            this.sourceClone.style.opacity = "0";
        }

        let activeClone;
        if (top === null) {
            activeClone = this.getSourceClone();
        } else {
            if (!this.clones.has(top)) {
                let clone = top['createDragImage'](this.selfTransform);
                if (clone === 'source') {
                    clone = this.getSourceClone();
                } else if (clone !== null) {
                    clone.style.opacity = '0';
                    document.body.append(clone);
                }
                this.clones.set(top, clone);
            }
            activeClone = this.clones.get(top);
        }

        if (activeClone !== null) {
            activeClone.offsetWidth; // Forces broswer reflow
            activeClone.style.opacity = "0.7";
        }
    }

    getSourceClone() {
        if (this.sourceClone === null) {
            this.sourceClone = this.source['createDragImage'](this.selfTransform);
            this.sourceClone.style.opacity = '0';
            document.body.append(this.sourceClone);
        }
        return this.sourceClone;
    }

    onDragPositionChanged(event) {
        this.clones.forEach((clone) => {
            clone.style.left = dnd.position.x + "px";
            clone.style.top = dnd.position.y + "px";
        });
        if (this.sourceClone) {
            this.sourceClone.style.left = dnd.position.x + "px";
            this.sourceClone.style.top = dnd.position.y + "px";
        }
    }

}

new DragImagesManager();