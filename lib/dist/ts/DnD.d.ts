import { Vue } from "vue-property-decorator";
/**
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits all
 * kinds of events during the progress of the drag and drop. It is a Vue instance, so its data is reactive and listeners
 * can be attachted to it using the method $on.
 */
export declare class DnD extends Vue {
    inProgress: boolean;
    type: any;
    data: any;
    source: Vue;
    stack: Vue[];
    position: {
        x: number;
        y: number;
    };
    startDrag(source: Vue, event: MouseEvent, type: any, data: any): void;
    stopDrag(): void;
    protected ancestors(comp: Vue): any[];
    mouseEnter(enter: Vue): void;
    mouseLeave(leave: Vue): void;
    mouseMove(event: any): void;
    top(): Vue;
}
export declare let dnd: DnD;
