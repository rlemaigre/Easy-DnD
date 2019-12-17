import {ReorderEvent} from "./events";

export default function reorder(array: any[], event: ReorderEvent) {
    let tmp = array[event.from];
    array.splice(event.from, 1);
    array.splice(event.to, 0, tmp);
}