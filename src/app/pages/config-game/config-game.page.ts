import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Settings } from '../../providers/Settings';
import { Stats } from '../../providers/Stats';

@Component({
  selector: 'app-config-game',
  templateUrl: './config-game.page.html',
  styleUrls: ['./config-game.page.scss'],
})
export class ConfigGamePage {
  pointscount: number;
  sets: number;
  legs: number;
  volume: string;
  players: Array<{ name: string }>;
  names: Array<any>;

  constructor(public navCtrl: NavController, public router: Router, public settings: Settings, public stats: Stats) {
    this.sets = 1;
    this.pointscount = 501
    this.legs = 2;
    this.names = [];
  }

  ionViewDidEnter() {
    var me = this;
    this.settings.getPlayers().then((result) => {
      if (result.length === 0) {
        me.names.push({ Name: "Spieler 1" });
        me.names.push({ Name: "Spieler 2" });
      } else {
        for (var i=0; i < result.length; i++) {
          me.names.push(result[i]);
        }
      }
      if (result.length === 1) {
        me.names.push({ Name: "Spieler 2" });
      }
      me.players = [{ name: me.names[0].Name }, { name: me.names[1].Name }];
    });
  }

  removePlayer(player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  closePage() {
    this.router.navigate(['/start']);
  }

  addPlayer() {
    var name: string;
    if (this.settings.players[this.players.length]) {
      name = this.settings.players[this.players.length].Name;
    } else {
      name = this.settings.players[0].Name
    }
    this.players.push({ name: name });
  }

  startGame() {
    var names = [];
    for (var i = 0; i < this.players.length; i++) {
      names.push(this.players[i].name);
    }
    if (names.length === 0) {
      return;
    }
    this.stats.addGame(this.pointscount, this.legs, this.sets).then((game) => {
      var params = {
        gameId: game.Id
      }
      game.setPlayers(names);
      this.router.navigate(['/game', params]);
    });
  }

  public onItemReorder({ detail }) {
    const itemMove = this.players.splice(detail.from, 1)[0];
    this.players.splice(detail.to, 0, itemMove);
    detail.complete(true);
  }

  remove(id) {
    if (id == "set") {
      if (this.sets > 1) {
        this.sets--;
      }
    } else {
      if (this.legs > 1) {
        this.legs--;
      }
    }
  }

  add(id) {
    if (id == "set") {
      this.sets++;
    } else {
      this.legs++;
    }
  }

}
