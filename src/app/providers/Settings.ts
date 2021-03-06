import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Account } from './Account';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class Settings {
    players: Array<any>
    colors: Array<string>
    currentPlayer: any
    doubleTitle: string
    constructor(public storage: Storage, private toastController: ToastController) {
        this.players = [];
        this.currentPlayer = {
            Account: "",
            Doubles: []
        };
        this.doubleTitle = "";
        this.setColors()
    }
    setColors() {
        this.colors = [
            'rgb(252, 3, 36)',
            'rgb(36, 252, 3)',
            'rgb(252, 140, 3)',
            'rgb(3, 40, 252)',
            'rgb(3, 235, 252)',
            'rgb(252, 211, 3)',
            'rgb(3, 40, 252)'
        ]
    }
    getAspectRadio(): number {
        if (this.isDesktop() === true) {
            return 3;
        } 
        return 2;
    }
    isDesktop(): boolean {
        var isTouchDevice = function () { return 'ontouchstart' in window || 'onmsgesturechange' in window; };
        var desktop = window.screenX != 0 && !isTouchDevice() ? true : false;
        return desktop;
    }
    async getPlayers() {
        if (this.players.length > 0) {
            return this.players; //already read Players from storage
        }
        return await this.storage.get('accounts').then((val) => {
            if (val) {
                for (var i = 0; i < val.length; i++) {
                    var acc = new Account(val[i].Name);
                    acc.setDoubles(val[i].Doubles);
                    this.players.push(acc);
                }
            }
            return this.players;
        });
    }
    setCurrentPlayer(player: Account) {
        this.currentPlayer = player;
    }
    hideDoubles() {
        this.currentPlayer = {
            Account: "",
            Doubles: []
        };
    }
    getCurrenPlayer() {
        return this.currentPlayer;
    }
    saveToStorage() {
        this.storage.set('accounts', this.players);
    }
    addPlayer(name: string) {
        var acc = new Account(name);
        if (this.checkAccountAlreadyExist(name) === true) {
            this.players.push(acc);
            this.storage.set('accounts', this.players);
        }
    }
    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
        this.storage.set('accounts', this.players);
    }
    checkAccountAlreadyExist(name): boolean {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].Name === name) {
                this.presentToast("Spieler mit gleichem Namen exestiert bereits")
                return false;
            }
        }
        return true;
    }
    getAccountByName(name: string): Account {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].Name === name) {
                return this.players[i];
            }
        }
    }
    getDefaultPriority() {
        return ["D16", "D20", "D18", "D10", "D8", "D12", "D4", "D2", "BULL", "D1", "D9", "D7"];
    }
    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000
        });
        toast.present();
    }
}