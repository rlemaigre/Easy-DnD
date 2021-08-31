const options = {
    'drag.dragImageOpacity': 0.7,
    'drag.goBack': false,
    'drag.handle': undefined,
    'drag.delta': 3,
    'drag.delay': 0,
    'drag.dragClass': null,
    'drag.vibration': 0,
    'drag.scrollingEdgeSize': 100,
    'drop.mode': 'copy',
    'drop.dragImageOpacity': 0.7,
    'components.dropList.noAnimations': false,
    'components.dropList.scrollingEdgeSize': undefined
};

export function setOptions (vals = {}) {
    const allKeys = Object.keys(options);
    for (const key in vals) {
        if (!allKeys.includes(key)) {
            console.error(`Key '${key}' does not exist`);
        }
        else {
            options[key] = vals[key]
        }
    }
}

export default options;
