export class DnDEvent {
    // todo - top, previousTop, source were "Vue" cast - check current cast
    type;
    data;
    top;
    previousTop;
    source;
    position;
    success;
    native;
}

export class ReorderEvent {
    
    from;
    to;
    
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    apply(array) {
        let tmp = array[this.from];
        array.splice(this.from, 1);
        array.splice(this.to, 0, tmp);
    }

}

export class InsertEvent {
    
    type;
    data;
    index;
    
    constructor(type, data, index) {
        this.type = type;
        this.data = data;
        this.index = index;
    }
}
