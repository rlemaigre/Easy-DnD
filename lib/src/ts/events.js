export class DnDEvent {
    // todo - top, previousTop, source were "Vue" cast - check current cast
    type: any;
    data: any;
    top: any;
    previousTop: any;
    source: any;
    position: { x, y };
    success: Boolean;
    native: TouchEvent | MouseEvent;

}

export class ReorderEvent {
    
    public from: number;
    public to: number;
    
    constructor(
        from: number,
        to: number
    ) {
        this.from = from;
        this.to = to;
    }

    apply(array: any[]) {
        let tmp = array[this.from];
        array.splice(this.from, 1);
        array.splice(this.to, 0, tmp);
    }

}

export class InsertEvent {
    
    public type: any;
    public data: any;
    public index: number;
    
    constructor(
        type: any,
        data: any,
        index: number
    ) {
        this.type = type;
        this.data = data;
        this.index = index;
    }

}
