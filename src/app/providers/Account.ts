import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class Account {
    public Name: String;
    private Doubles: Array<any>;
    constructor(name: String) {
        this.Name = name;
        this.Doubles = ["D16", "D20", "D10", "D18", "D8", "D12", "D4", "D2", "D14", "D15", "D19", "D13", "D5", "D6", "D17", "D11","BULL", "D1", "D9", "D7", "D3"];
    }
    setDoubles(doubles: Array<any>) {
        this.Doubles = doubles;
    }
    getDoubles() {
        return this.Doubles;
    }
}