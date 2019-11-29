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
export declare class DNDEvent {
    type: any;
    data: any;
    mouse: MouseEvent;
    constructor(type: any, data: any, mouse: MouseEvent);
}
export declare class DragStateImpl implements DragState {
    inProgress: boolean;
    type: string;
    data: any;
    feedback: any;
    source: Vue;
    stack: Vue[];
    clones: Map<HTMLElement, HTMLElement>;
    selfTransform: string;
    /**
     * Appelée lors du début du drag avec en paramètre le composant Drag dont le drag part.
     */
    init(source: Vue, event: MouseEvent): void;
    private ancestors;
    /**
     * Appelée en fin de drag après le drop.
     */
    clear(): void;
    private getSourceModel;
    /**
     * Retourne l'élément modèle de l'image de drag courante.
     */
    private getModel;
    private getSourceTransform;
    /**
     * Retourne la transformation à appliquer à l'image de drag courante.
     */
    private getTransform;
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
