import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Settings } from '../../providers/Settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  players: Array<{ name: string }>;
  playername: string;

  constructor(public router: Router, public storage: Storage, private settings: Settings) {
    this.playername = "";
    settings.getPlayers();
  }

  public onItemReorder({ detail }) {
    const itemMove = this.settings.getCurrenPlayer().Doubles.splice(detail.from, 1)[0];
    this.settings.getCurrenPlayer().Doubles.splice(detail.to, 0, itemMove);
    this.settings.getCurrenPlayer().setDoubles(this.settings.getCurrenPlayer().Doubles);
    this.settings.saveToStorage();
    detail.complete(true);
  }

  changeDoubles(acc) {
    if (this.settings.getCurrenPlayer() === acc) {
      this.settings.hideDoubles();
      this.settings.doubleTitle = "";
      return;
    }
    this.settings.setCurrentPlayer(acc);
    this.settings.doubleTitle = "Doppel Priorität von " + this.settings.currentPlayer.Name;
  }

  safe() {
    if (this.playername.length > 0) {
      this.settings.addPlayer(this.playername);
      this.playername = "";
    }
  }

  remove(player) {
    this.settings.removePlayer(player);
  }

  closePage() {
    this.router.navigate(['/start']);
  }
}
