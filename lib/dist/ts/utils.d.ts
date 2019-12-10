import { Vue } from "vue-property-decorator";
/**
 * Creates a drag image using the given element as model.
 */
export declare function createDragImage(el: HTMLElement): HTMLElement;
export interface DragState {
    inProgress: boolean;
    type: string;
    data: any;
}
export declare class DnDEvent {
    type: any;
    data: any;
    mouse: MouseEvent;
    constructor(type: any, data: any, mouse: MouseEvent);
}
export declare class InsertEvent {
    type: any;
    data: any;
    index: number;
    constructor(type: any, data: any, index: number);
}
export declare class ReorderEvent {
    fromIndex: number;
    toIndex: number;
    constructor(fromIndex: number, toIndex: number);
    apply(array: any[]): void;
}
export declare class Position {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
export declare class DragStateImpl implements DragState {
    inProgress: boolean;
    type: string;
    data: any;
    source: Vue;
    stack: Vue[];
    clones: Map<Vue, HTMLElement>;
    selfTransform: string;
    mousePosition: Position;
    /**
     * Appelée lors du début du drag avec en paramètre le composant Drag dont le drag part.
     */
    init(source: Vue, event: MouseEvent, type: any, data: any): void;
    private ancestors;
    /**
     * Appelée en fin de drag après le drop.
     */
    clear(): void;
    /**
     * Appelée sur le mouseenter d'un composant Drop.
     */
    mouseEnter(enter: Vue, event: MouseEvent): void;
    /**
     * Appelée sur le mouseleave d'un composant Drop.
     */
    mouseLeave(event: MouseEvent): void;
    /**
     * Met à jour les clones en fonction de l'état courant.
     */
    private updateClonesVisibility;
    /**
     * Retourne le clone actif en fonction de l'état courant.
     */
    private getActiveClone;
    /**
     * Retourne le composant Drop le plus à l'avant plan sous la souris ou null s'il n'y en a pas.
     */
    top(): Vue;
    /**
     * Moves all the clones to the position of the mouse pointer.
     */
    move(event: any): void;
}
export declare let dndimpl: DragStateImpl;
export declare let dnd: DragState;
