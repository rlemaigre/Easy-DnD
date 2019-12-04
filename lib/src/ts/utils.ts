import {Vue} from "vue-property-decorator";

const minScale = "0.5";

/**
 * Creates a drag image using the given element as model.
 */
export function createDragImage(el: HTMLElement): HTMLElement {
    let clone = deepClone(el);
    clone.style.position = 'fixed';
    clone.style.margin = '0';
    clone.style["z-index"] = '1000';
    clone.style.transition = 'opacity 0.2s, transform 0.2s';
    return clone;
}

/**
 * Clones the given element and all its descendants in a way that the computed styles of the clones are the same as the
 * computed styles of the originals whatever the location in the DOM the clones are injected. Returns the root of the clone.
 */
function deepClone(el: HTMLElement): HTMLElement {
    let clone = el.cloneNode(true) as HTMLElement;
    copyStyle(el, clone);
    let vSrcElements = el.getElementsByTagName("*");
    let vDstElements = clone.getElementsByTagName("*");
    for (let i = vSrcElements.length; i--;) {
        let vSrcElement = vSrcElements[i] as HTMLElement;
        let vDstElement = vDstElements[i] as HTMLElement;
        copyStyle(vSrcElement, vDstElement);
    }
    return clone;
}

/**
 * Copy the computed styles from src to destination.
 */
function copyStyle(src: HTMLElement, destination: HTMLElement) {
    const computedStyle = window.getComputedStyle(src);
    Array.from(computedStyle).forEach(key => {
        destination.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key))
    });
    destination.style.pointerEvents = 'none';
}

function changeScale(element, newScale) {
    if (element.style.transform !== 'none') {
        if (element.style.transform.includes('scale')) {
            element.style.transform = element.style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(' + newScale + ')');
        } else {
            element.style.transform = element.style.transform + ' scale(' + newScale + ')';
        }
    } else {
        element.style.transform = 'scale(' + newScale + ')';
    }
}

export interface DragState {

    inProgress: boolean;
    type: string;
    data: any;

}

export class DnDEvent {

    constructor(
        public type: any,
        public data: any,
        public mouse: MouseEvent
    ) {
    }

}

export class Position {

    constructor(
        public x: number,
        public y: number) {
    }

}

export class DragStateImpl implements DragState {

    public inProgress = false;
    public type: string = null;
    public data: any = null;
    public source: Vue = null;
    public stack: Vue[] = null;
    public clones: Map<HTMLElement, HTMLElement> = null;
    public selfTransform: string = null;
    public mousePosition: Position = null;

    /**
     * Appelée lors du début du drag avec en paramètre le composant Drag dont le drag part.
     */
    init(source: Vue, event: MouseEvent) {
        let startPos = {
            x: event.pageX,
            y: event.pageY
        };
        let sourcePos = {
            x: source.$el.getBoundingClientRect().left,
            y: source.$el.getBoundingClientRect().top
        };
        this.selfTransform = "translate(-" + (startPos.x - sourcePos.x) + "px, -" + (startPos.y - sourcePos.y) + "px)";
        this.source = source;
        this.stack = this.ancestors(this.source);
        this.clones = new Map<HTMLElement, HTMLElement>();
        this.mousePosition = {
            x: event.pageX,
            y: event.pageY
        };
        this.inProgress = true;
        Vue.nextTick(() => this.updateClonesVisibility());
    }

    private ancestors(comp: Vue) {
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

    /**
     * Appelée en fin de drag après le drop.
     */
    clear() {
        this.inProgress = false;
        this.data = null;
        this.source = null;
        this.stack = null;
        this.clones.forEach((clone) => {
            clone.remove();
        });
        this.clones = null;
    }

    private getSourceModel(): HTMLElement {
        if (this.source.$refs['drag-image']) {
            let el = this.source.$refs['drag-image'] as HTMLElement;
            if (el.childElementCount !== 1)
                return el;
            else
                return el.children.item(0) as HTMLElement;
        } else {
            return this.source.$el as HTMLElement;
        }
    }

    /**
     * Retourne l'élément modèle de l'image de drag courante.
     */
    private getModel(): HTMLElement {
        let top = this.top();
        if (top === null || top['isDropMask']) {
            return this.getSourceModel();
        } else {
            if (top.$refs['drag-image']) {
                let el = top.$refs['drag-image'] as HTMLElement;
                if (el.childElementCount > 1)
                    return el;
                else
                    return el.children.item(0) as HTMLElement;
            } else {
                return this.getSourceModel();
            }
        }
    }

    private getSourceTransform() {
        if (this.source.$refs['drag-image']) {
            return () => {
            };
        } else {
            return (clone: HTMLElement) => {
                clone.style.transform = this.selfTransform;
            };
        }
    }

    /**
     * Retourne la transformation à appliquer à l'image de drag courante.
     */
    private getTransform() {
        let top = this.top();
        if (top === null || top['isDropMask']) {
            return this.getSourceTransform();
        } else {
            if (top.$scopedSlots['drag-image']) {
                return () => {
                };
            } else {
                return this.getSourceTransform();
            }
        }
    }

    /**
     * Appelée sur le mouseenter d'un composant Drop.
     */
    mouseEnter(enter: Vue, event: MouseEvent) {
        // Drag leave de la zone précédente :
        if (this.stack.length > 0) {
            let leave = this.stack[this.stack.length - 1];
            leave.$emit('dragleave', new DnDEvent(this.type, this.data, event));
        }

        // Drag enter dans la nouvelle zone :
        enter.$emit('dragenter', new DnDEvent(this.type, this.data, event));

        // Mise à jour de la pile :
        this.stack.push(enter);

        // Mise à jour des clones en fonction de l'état courant :
        this.updateClonesVisibility();
    }

    /**
     * Appelée sur le mouseleave d'un composant Drop.
     */
    mouseLeave(event: MouseEvent) {
        // Drag leave de la zone précédente :
        let leave = this.stack[this.stack.length - 1];
        leave.$emit('dragleave', new DnDEvent(this.type, this.data, event));

        // Mise à jour de la pile :
        this.stack.pop();

        // Drag enter dans la nouvelle zone :
        if (this.stack.length > 0) {
            let enter = this.stack[this.stack.length - 1];
            enter.$emit('dragenter', new DnDEvent(this.type, this.data, event));
        }

        // Mise à jour de la visibilité des clones en fonction de l'état courant :
        this.updateClonesVisibility();
    }

    /**
     * Met à jour les clones en fonction de l'état courant.
     */
    private updateClonesVisibility() {
        // On met tous les clones en visibilité nulle, taille minimale :
        this.clones.forEach(clone => {
            clone.style.opacity = "0";
            changeScale(clone, minScale);
        });

        // On met le clone actif en visibilité maximale, taille maximale :
        let clone = this.getActiveClone();
        if (clone !== null) {
            // Important. This forces a browser reflow, so the transition on opacity is triggered
            // when the clone enters the DOM :
            clone.offsetWidth;
            clone.style.opacity = "0.7";
            changeScale(clone, 1);
        }
    }

    /**
     * Retourne le clone actif en fonction de l'état courant.
     */
    private getActiveClone(): HTMLElement {
        let model = this.getModel();
        let transform = this.getTransform();
        if (model !== null) {
            if (!this.clones.has(model)) {
                let clone;
                if (model.parentElement) {
                    clone = createDragImage(model);
                } else {
                    clone = model;
                }
                transform(clone);
                clone.style.opacity = '0';
                changeScale(clone, minScale);
                document.body.append(clone);
                this.clones.set(model, clone);
            }
            return this.clones.get(model);
        } else {
            return null;
        }
    }

    /**
     * Retourne le composant Drop le plus à l'avant plan sous la souris ou null s'il n'y en a pas.
     */
    top() {
        return this.stack.length === 0 ? null : this.stack[this.stack.length - 1];
    }
 
    /**
     * Moves all the clones to the position of the mouse pointer.
     */
    move(event) {
        this.clones.forEach((clone) => {
            clone.style.left = event.pageX + "px";
            clone.style.top = event.pageY + "px";
        });
        this.mousePosition = {
            x: event.pageX,
            y: event.pageY
        };
    }

}

export let dndimpl = new DragStateImpl();
dndimpl = Vue.observable(dndimpl);
export let dnd: DragState = dndimpl;