import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  players: Array<{ name: string }>;
  playername: string;

  constructor(public router: Router, public storage: Storage) {
    storage.get('names').then((val) => {
      if (val) {
        this.players = val;
      } else {
        this.players = [];
      }
    });
  }

  safe() {
    if (this.playername != "") {
      this.players.push({ name: this.playername })
      this.storage.set('names', this.players);
      this.playername = "";
    }
  }

  remove(player) {
    this.players.splice(this.players.indexOf(player), 1);
    this.storage.set('names', this.players);
  }

  closePage() {
    this.router.navigate(['/start']);
  }
}
