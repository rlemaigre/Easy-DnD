import * as all from './index';

var components = {
    Drag: all.Drag, Drop: all.Drop, DropList: all.DropList, DropMask: all.DropMask
};

if (typeof Vue !== 'undefined') {
    for (const name in components) {
        Vue.component(name, components[name])
    }
}