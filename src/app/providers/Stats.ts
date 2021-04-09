import { Injectable } from '@angular/core';
import { Game } from './Game';
import { Storage } from '@ionic/storage';
@Injectable({
    providedIn: 'root'
})
export class Stats {
    public Games: object;
    constructor(public storage: Storage) {
        this.Games = {};
    }
    async addGame(points: number, legsToWin: number, setsToWin: number) {
        return await this.getGamesFromStorage().then((result) => {
            var game = new Game(this.getNextId(), points, legsToWin, setsToWin)
            this.Games[game.Id] = game;
            this.saveGame();
            return this.Games[game.Id];
        })
    }
    getGame(gameId: number): Game {
        if (this.Games[gameId]) {
            return this.Games[gameId];
        }
    }
    delteGame(gameId: number): object {
        delete this.Games[gameId];
        this.saveGame();
        return this.Games;
    }
    saveGame() {
        this.storage.set('games', this.Games);
    }
    async getGamesFromStorage() {
        if (this.getGamesLength() > 0) {
            return this.Games;
        }
        return await this.storage.get('games').then((val) => {
            if (val) {
                for (var i in val) {
                    var g = new Game(val[i].Id, val[i].gamePoints, val[i].legsToWin, val[i].setsToWin);
                    g.setData(val[i]);
                    this.Games[g.Id] = g;
                }
            }
            return this.Games;
        });
    }

    getNextId(): number {
        var c = 0;
        for(var key in this.Games) {
            if (this.Games[key].Id > c) {
                c = this.Games[key].Id;
            }
        }
        c++;
        return c;
    }

    getGamesLength(): number {
        var c = 0;
        for(var key in this.Games) {
            c++;
        }
        return c;
    }

    deleteAllGames() {
        this.Games = {};
        this.storage.set('games', {});
    }
}