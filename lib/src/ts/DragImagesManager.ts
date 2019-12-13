import {Vue} from "vue-property-decorator";
import {dnd} from "./globals";

/**
 * This class reacts to drag events emitted by the dnd object to manage a sequence of drag images and fade from one to the
 * other as the drag progresses.
 */
export class DragImagesManager extends Vue {

    private selfTransform: string = null;
    private clones: Map<Vue, HTMLElement> = null;

    constructor() {
        super();
        dnd.$on('dragstart', this.onDragStart);
        dnd.$on('dragenter', this.onDragEnter);
        dnd.$on('dragleave', this.onDragLeave);
        dnd.$on('dragmove', this.onDragMove);
        dnd.$on('dragend', this.onDragEnd);
    }

    protected onDragStart() {
        console.log("drag-started");
        let sourcePos = {
            x: dnd.source.$el.getBoundingClientRect().left,
            y: dnd.source.$el.getBoundingClientRect().top
        };
        this.selfTransform = "translate(-" + (dnd.position.x - sourcePos.x) + "px, -" + (dnd.position.y - sourcePos.y) + "px)";
        this.clones = new Map<Vue, HTMLElement>();
        this.updateClonesVisibility();
    }

    protected onDragEnd() {
        console.log("drag-ended");
        this.clones.forEach((clone) => {
            clone.remove();
        });
        this.clones = null;
        this.selfTransform = null;
    }

    protected onDragEnter() {
        this.updateClonesVisibility();
    }

    protected onDragLeave() {
        this.updateClonesVisibility();
    }

    protected onDragMove() {
        this.clones.forEach((clone) => {
            clone.style.left = dnd.position.x + "px";
            clone.style.top = dnd.position.y + "px";
        });
    }

    private updateClonesVisibility() {
        this.clones.forEach(clone => {
            clone.style.opacity = "0";
        });
        let clone = this.getActiveClone();
        if (clone !== null) {
            // Important. This forces a browser reflow, so the transition on opacity is triggered
            // when the clone enters the DOM :
            clone.offsetWidth;
            clone.style.opacity = "0.7";
        }
    }

    private getActiveClone(): HTMLElement {
        // Object to get the drag image of :
        let model = dnd.top();
        if (model === null) model = dnd.source;

        // Update clone map with missing key value pair if need be :
        if (!this.clones.has(model)) {
            let clone = model['createDragImage'](this.selfTransform);
            if (clone === 'source') {
                clone = dnd.source['createDragImage'](this.selfTransform);
            }
            if (clone !== null) {
                clone.style.opacity = '0';
                document.body.append(clone);
            }
            this.clones.set(model, clone);
        }

        // Lookup result in clones map :
        return this.clones.get(model);
    }

}