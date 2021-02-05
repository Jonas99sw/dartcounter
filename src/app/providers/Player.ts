import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class Player {
    private name: string
    private points: number
    public legsWon: number
    public totalLegWins: number
    public setsWon: number
    private avarageTotal: number
    public statsInfo: any
    public checkouts: Array<number>
    public checkoutChances: number
    public finishWay: String
    public Sets: any;
    public finishTable: Array<any>
    constructor(name: string, points: number) {
        this.name = name;
        this.points = points;
        this.legsWon = 0;
        this.setsWon = 0;
        this.totalLegWins = 0;
        this.avarageTotal = 0;
        this.finishTable = [];
        this.statsInfo = [
            { point: 60, count: 0 },
            { point: 80, count: 0 },
            { point: 100, count: 0 },
            { point: 140, count: 0 },
            { point: 180, count: 0 }
        ];
        this.checkouts = [];
        this.checkoutChances = 0;
        this.Sets = {};
        this.Sets[1] = {
            Avarage: 0,
            Legs: {
                1: {
                    Avarage: 0,
                    Darts: 0,
                    Points: []
                }
            }
        }
    }
    setData(data) {
        this.legsWon = data.legsWon;
        this.setsWon = data.setsWon;
        this.totalLegWins = data.totalLegWins;
        this.avarageTotal = data.avarageTotal;
        this.finishTable = data.finishTable;
        this.statsInfo = data.statsInfo;
        this.checkouts = data.checkouts;
        this.checkoutChances = data.checkoutChances;
        this.Sets = data.Sets;
    }
    getName() {
        return this.name;
    }
    getAvarageTotal(): number {
        return this.avarageTotal;
    }
    getPoints() {
        return this.points;
    }
    addCheckout(points: number) {
        this.checkouts.push(points);
    }
    resetPoints(points: number) {
        this.points = points;
    }
    checkPoints(points: number): boolean {
        if (this.points >= points && (this.points - points >= 2 || this.points === points)) {
            return true;
        }
        return false;
    }
    isFinishPosible(): boolean {
        if (this.finishTable.length > 0) {
            return true;
        }
        return false;
    }
    scorePoints(points: number) {
        this.points -= points;
        this.checkStats(points);
        if (this.finishTable.length > 0) {
            this.checkoutChances++;
        }
    }
    checkStats(points: number) {
        for (var i= this.statsInfo.length-1; i >=0; i--) {
            if (points >= this.statsInfo[i].point) {
                this.statsInfo[i].count++;
                return;
            }
        }
    }
    addThrownDarts(leg: number, set: number, points: number, darts: number) {
        this.Sets[set].Legs[leg].Darts += darts;
        this.Sets[set].Legs[leg].Points.push(points);
        this.setAvarages(leg, set);
    }
    setAvarages(leg: number, set: number) {
        this.avarageTotal = this.getTotalAvarage();
        this.Sets[set].Avarage = this.getSetAvarage(set);
        this.Sets[set].Legs[leg].Avarage = this.getLegAvarage(leg, set);
    }
    getLegAvarage(leg: number, set: number): number {
        var allPoints = 0;
        var thrownDarts = 0;
        thrownDarts += this.Sets[set].Legs[leg].Darts;
        for (var i = 0; i < this.Sets[set].Legs[leg].Points.length; i++) {
            allPoints += this.Sets[set].Legs[leg].Points[i];
        }
        return (Math.round((allPoints / (thrownDarts / 3)) * 100) / 100);
    }
    getSetAvarage(set: number): number {
        var allPoints = 0;
        var thrownDarts = 0;
        for (var leg in this.Sets[set].Legs) {
            thrownDarts += this.Sets[set].Legs[leg].Darts;
            for (var i = 0; i < this.Sets[set].Legs[leg].Points.length; i++) {
                allPoints += this.Sets[set].Legs[leg].Points[i];
            }
        }
        return (Math.round((allPoints / (thrownDarts / 3)) * 100) / 100);
    }
    getTotalAvarage(): number {
        var allPoints = 0;
        var thrownDarts = 0;
        for (var set in this.Sets) {
            for (var leg in this.Sets[set].Legs) {
                thrownDarts += this.Sets[set].Legs[leg].Darts;
                for (var i = 0; i < this.Sets[set].Legs[leg].Points.length; i++) {
                    allPoints += this.Sets[set].Legs[leg].Points[i];
                }
            }
        }
        return (Math.round((allPoints / (thrownDarts / 3)) * 100) / 100);
    }
    addSet(set: number) {
        this.Sets[set] = {
            Avarage: 0,
            Legs: {
                1: {
                    Avarage: 0,
                    Darts: 0,
                    Points: []
                }
            }
        }
    }
    addLeg(set: number, leg: number) {
        this.Sets[set].Legs[leg] = {
            Avarage: 0,
            Darts: 0,
            Points: []
        }
    }
}