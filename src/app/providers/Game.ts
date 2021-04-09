import { Injectable } from '@angular/core';
import { Player } from './Player';
@Injectable({
    providedIn: 'root'
})
export class Game {
    Id: number;
    players: Array<Player>;
    acctualPlayer: number;
    acctualLeg: number;
    acctualSet: number;
    legsToWin: number;
    setsToWin: number;
    isFinished: boolean;
    playerStartedSet: number;
    playerStartedGame: number;
    gamePoints: number; //501
    playerWon: number;
    date: Date;
    constructor(Id: number, gamePoints: number, legsToWin: number, setsToWin: number) {
        this.Id = Id;
        this.gamePoints = gamePoints;
        this.legsToWin = legsToWin;
        this.setsToWin = setsToWin;
        this.acctualLeg = 1;
        this.acctualSet = 1;
        this.playerStartedSet = 0;
        this.playerStartedGame = 0;
        this.acctualPlayer = 0;
        this.isFinished = false;
        this.players = [];
        this.date = new Date();
    }
    setData(data) {
        this.gamePoints = data.gamePoints;
        this.legsToWin = data.legsToWin;
        this.setsToWin = data.setsToWin;
        this.acctualLeg = data.acctualLeg;
        this.acctualSet = data.acctualSet;
        this.playerStartedSet = data.playerStartedSet;
        this.playerStartedGame = data.playerStartedGame;
        this.acctualPlayer = data.acctualPlayer;
        this.isFinished = data.isFinished;
        this.date = data.date;
        if (data.playerWon) {
            this.playerWon = data.playerWon;
        }
        for (var i=0; i < data.players.length; i++) {
            var p = new Player(data.players[i].name, data.players[i].points);
            p.setData(data.players[i]);
            this.players.push(p);
            if (this.setsToWin === 1 && p.legsWon === this.legsToWin) {
                this.playerWon = i;
            } else if(this.setsToWin === p.setsWon) {
                this.playerWon = i;
            } else if(i+1 === data.players.length && this.playerWon !== 0 && this.playerWon !== 1) {
                var notFinished = true;
            }
        }
    }
    getNames() {
        var names = [];
        for (var i=0;i<this.players.length;i++) {
           names.push(this.players[i].getName());
        }
        return names;
    }
    getPlayedSetsLength() {
        var c = 0;
        for (var key in this.players[0].Sets) {
            c++;
        }
        return c;
    }
    getPlayedLegsForSetLength(set: number) {
        var c = 0;
        for (var key in this.players[0].Sets[set].Legs) {
            c++;
        }
        return c;
    }
    setPlayers(playerNames: Array<string>) {
        for (var i = 0; i < playerNames.length; i++) {
            this.players.push(new Player(playerNames[i], this.gamePoints));
        }
    }
    getAcctualPlayer() {
        return this.players[this.acctualPlayer];
    }
    nextPlayer() {
        this.acctualPlayer++;
        if (this.players.length === this.acctualPlayer) {
            this.acctualPlayer = 0;
        }
    }
    nextPlayerForSet() {
        this.playerStartedGame++
        if (this.players.length === this.playerStartedGame) {
            this.playerStartedGame = 0;
            this.acctualPlayer = 0;
        }
        this.acctualPlayer = this.playerStartedGame;
        this.playerStartedSet = this.playerStartedGame;
    }
    nextPlayerForLeg() {
        this.playerStartedSet++
        if (this.players.length === this.playerStartedSet) {
            this.playerStartedSet = 0;
        }
        this.acctualPlayer = this.playerStartedSet;
    }
    addThownDartsForPlayer(points: number, darts: number) {
        this.getAcctualPlayer().addThrownDarts(this.acctualLeg, this.acctualSet, points, darts);
    }
    checkGameWin(): boolean {
        if (this.getAcctualPlayer().setsWon === this.setsToWin) {
            this.isFinished = true;
            this.playerWon = this.acctualPlayer;
            return true;
        }
        return false;
    }
    legWon() {
        this.getAcctualPlayer().legsWon++;
        this.getAcctualPlayer().totalLegWins++;
        if (this.getAcctualPlayer().legsWon === this.legsToWin) {
            this.acctualLeg = 1;
            this.getAcctualPlayer().setsWon++;
        }
    }
    nextLeg() {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].resetPoints(this.gamePoints);
        }
        if (this.getAcctualPlayer().legsWon === this.legsToWin) {//new set
            this.acctualSet++;
            for (var i = 0; i < this.players.length; i++) {
                this.players[i].addSet(this.acctualSet);
                this.players[i].legsWon = 0;
            }
            this.nextPlayerForSet()
        } else {//new leg
            this.acctualLeg++;
            for (var i = 0; i < this.players.length; i++) {
                this.players[i].addLeg(this.acctualSet, this.acctualLeg);
            }
            this.nextPlayerForLeg()
        }
        ;
    }
    removeLastThrow() {
        this.getLastPlayer().removeLastThrow(this.acctualSet, this.acctualLeg);
        this.acctualPlayer = this.getLastPlayerId();
    }
    getLastPlayer() {
        return this.players[this.getLastPlayerId()];
    }
    getLastPlayerId() {
        var playerId;
        if (this.acctualPlayer > 0) {
            playerId = this.acctualPlayer - 1;
        } else {
            playerId = this.players.length - 1;
        }
        return playerId;
    }
}