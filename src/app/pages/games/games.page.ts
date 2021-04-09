import { Component, OnInit } from '@angular/core';
import { Stats } from '../../providers/Stats';
import { AlertController } from '@ionic/angular';

import { Router } from '@angular/router';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {
  games: object;
  gamesList: Array<any>;
  delteGameDialogOpen: boolean;
  constructor(private stats: Stats, private router: Router, private alertCtrl: AlertController) {
    this.games = {};
    this.gamesList = [];
    this.delteGameDialogOpen = false;
  }

  buildArray(data: object) {
    this.games = data;
    this.gamesList = [];
    const gArr = [];
    for (var key in data) {
      gArr.push(data[key]);
    }
    for (var i = gArr.length - 1; i >= 0; i--) {
      var obj = {
        Id: gArr[i].Id,
        date: this.formatDate(gArr[i].date),
        playerText: this.getPlayerText(gArr[i].players),
        winText: this.getWinText(gArr[i])
      }
      this.gamesList.push(obj);
    }
  }

  ionViewDidEnter() {
    this.stats.getGamesFromStorage().then(data => {
      this.buildArray(data);
    });
  }

  formatDate(datum) {
    var days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    var months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var min = datum.getMinutes();
    if (min < 10) {
      min = "0" + min.toString();
    }
    var time = datum.getHours() + ":" + min;
    return days[datum.getDay()] + " " + datum.getDate() + ' ' + months[datum.getMonth()] + ' ' + datum.getFullYear() + " " + time;
  }

  getPlayerText(players: any) {
    var text = "";
    for (var i = 0; i < players.length; i++) {
      if (i + 1 === players.length) {
        text += players[i].name;
        break;
      }
      text += players[i].name + " VS ";
    }
    return text;
  }

  getWinText(game: any) {
    if (game.playerWon === undefined) {
      return "not Finished";
    }
    var text = game.players[game.playerWon].name + " hat das Spiel mit ";
    var resultText = "";
    for (var i = 0; i < game.players.length; i++) {
      if (game.setsToWin > 1) {
        resultText += game.players[i].setsWon + "(" + game.players[i].totalLegWins + ")";
        if (i + 1 < game.players.length) {
          resultText += " - ";
        }
      } else {
        resultText += game.players[i].legsWon;
        if (i + 1 < game.players.length) {
          resultText += " - ";
        }
      }
    }
    if (game.setsToWin > 1) {
      resultText += " in Sets"
    } else {
      resultText += " in Legs"
    }
    return text + resultText + " gewonnen";
  }

  ngOnInit() {
  }

  pressCard(game) {
    if (this.delteGameDialogOpen === false) {
      this.router.navigateByUrl("/game-stats/" + game.Id)
    }
  }

  deleteGame(game) {
    this.delteGameDialogOpen = true;
    this.deleteGameDialog(game.Id)
  }

  async deleteGameDialog(gameId: number) {
    const dialog = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Spiel löschen?',
      message: '<strong>Wollen Sie das Spiel wirklich löschen?</strong>',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.delteGameDialogOpen = false;
          }
        }, {
          text: 'Ja',
          handler: () => {
            this.delteGameDialogOpen = false;
            this.buildArray(this.stats.delteGame(gameId));
          }
        }
      ]
    });
    await dialog.present();
  }

  closePage() {
    this.router.navigate(['/start']);
  }

}
