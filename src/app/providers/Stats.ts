import { Injectable } from '@angular/core';
import { Game } from './Game';
import { Storage } from '@ionic/storage';
@Injectable({
    providedIn: 'root'
})
export class Stats {
    public Games: Array<Game>;
    constructor(public storage: Storage) {
        this.Games = [];
    }
    async addGame(points: number, legsToWin: number, setsToWin: number) {
        return await this.getGamesFromStorage().then((result) => {
            this.Games.push(new Game(this.Games.length, points, legsToWin, setsToWin));
            return this.Games[this.Games.length - 1];
        })
    }
    getGame(gameId: number): Game {
        if (this.Games[gameId]) {
            return this.Games[gameId];
        }
    }
    saveGame() {
        this.storage.set('games', this.Games);
    }
    async getGameFromStorage(id: number) {
        return await this.storage.get('games').then((val) => {
            if (val[id]) {
                var g = new Game(val[id].Id, val[id].gamePoints, val[id].legsToWin, val[id].setsToWin);
                g.setData(val[id]);
                return g;
            }
        });
    }
    async getGamesFromStorage() {
        return await this.storage.get('games').then((val) => {
            if (val) {
                for (var i = 0; i < val.length; i++) {
                    var g = new Game(val[i].Id, val[i].gamePoints, val[i].legsToWin, val[i].setsToWin);
                    g.setData(val[i]);
                    this.Games.push(g);
                }
            }
            return this.Games;
        });
    }
}