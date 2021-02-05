import { Component, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, AlertController, IonSlides } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Settings } from '../../providers/Settings';
//import { PowerManagement } from '@ionic-native/power-management/ngx';
import { ChangeThrowsPage } from '../change-throws/change-throws.page';
import { Game } from '../../providers/Game';
import { Stats } from '../../providers/Stats';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage {
  @ViewChild(IonSlides) slides: IonSlides;
  players: Array<{
    name: string, points: number, legsWon: number, setsWon: number, avarageTotal: number,
    avarageLeg: number, avarageSet: number, finishWay: String, finishTable: Array<any>,
    dartsThrown: Array<{ leg: number, set: number, points: number }>
  }>;
  private game: Game;
  desktop: boolean;
  finishDialogOpen: boolean;
  wayToStart: boolean;
  thrownpoints: any;
  finishDialog: any;
  output = [];
  soFar = [];
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public router: Router,
    public toastController: ToastController, public modalCtrl: ModalController, private route: ActivatedRoute,
    public actionSheetController: ActionSheetController, private settings: Settings, private stats: Stats) {
    this.thrownpoints = "";
    this.wayToStart = false;
    this.route.params.subscribe(params => {
      var gameId = JSON.parse(params.gameId);
      this.finishDialogOpen = false;
      this.game = this.stats.getGame(gameId);
      if (!this.game) {
        this.stats.getGameFromStorage(gameId).then((game) => {
          this.game = game;
        })
      }
      settings.getPlayers();
      for (var i = 0; i < this.game.players.length; i++) {
        this.calculateFinishWay(i, this.game.players[i].getPoints());
      }
      var isTouchDevice = function () { return 'ontouchstart' in window || 'onmsgesturechange' in window; };
      this.desktop = window.screenX != 0 && !isTouchDevice() ? true : false;
      this.addKeyListenerEvent();
      this.setDisplayActivity();

    });
  }
  setDisplayActivity() {
    if (this.desktop === false) {
      (window as any).powerManagement.acquire(function () {
        console.log('Wakelock acquired');
      }, function () {
        console.log('Failed to acquire wakelock');
      });
    }
  }
  getColor(playerName) {
    if (this.game.getAcctualPlayer().getName() === playerName) {
      return "#a4dea0";
    }
    return "#ffffff";
  }
  addKeyListenerEvent() {
    if (this.desktop === true) {
      document.addEventListener('keydown', function (e) {
        var number = parseInt((e as any).key);
        var kfzregex = new RegExp("[0-9]{1,3}");
        if (kfzregex.test(String(number))) {
          if (this.finishDialogOpen === true) {
            this.finishDialogOpen = false;
            var points = this.game.getAcctualPlayer().getPoints();
            this.legWon(points, number);
            this.finishDialog.dismiss();
            return;
          }
          this.number(number);
        }
        if (e.key === "Enter") {
          this.enter();
        } else if (e.key === "Backspace") {
          this.delete();
        }
      }.bind(this));
    }
  }

  number(pressed) {
    var points = JSON.parse(this.thrownpoints + String(pressed));
    if (points <= 180) {
      this.thrownpoints = this.thrownpoints + String(pressed);
    }
  }

  showWays() {
    var waystoShow = 10;
    var addedEntrys = 0;
    var wayWithSameEnd = 2;
    var finishDart;
    var sameFinish = 1;
    if (this.game.getAcctualPlayer().finishTable[0]) {
      var subTitle = "";
      for (var i = 0; addedEntrys < waystoShow; i++) {
        if (this.game.getAcctualPlayer().finishTable.length == i) {
          break;
        }
        var dartslength = this.game.getAcctualPlayer().finishTable[i].Darts.length
        var way = this.game.getAcctualPlayer().finishTable[i].Darts.toString();
        if (finishDart === this.game.getAcctualPlayer().finishTable[i].Darts[dartslength - 1]) {
          if (sameFinish < wayWithSameEnd) {
            subTitle += "<h4>" + way.split(",").join(" - ") + "</h4>";
            sameFinish++;
            addedEntrys++;
          }
        } else {
          subTitle += "<h4>" + way.split(",").join(" - ") + "</h4>";
          sameFinish = 1;
          addedEntrys++;
        }
        finishDart = this.game.getAcctualPlayer().finishTable[i].Darts[dartslength - 1];
      }
      this.showFinishWays(subTitle);
    }
  }

  async showFinishWays(message) {
    let alert = await this.alertCtrl.create({
      header: 'Finish Wege',
      message: message,
      buttons: ['Okay']
    });
    await alert.present();
  }

  slideTap() {
    var data = {
      player: this.game.getAcctualPlayer(),
      leg: this.game.acctualLeg,
      that: this
    }
    this.showThrownDarts();
  }

  async showThrownDarts() {
    var data2 = {
      player: this.game.getAcctualPlayer(),
      set: this.game.acctualSet,
      leg: this.game.acctualLeg,
      that: this
    }

    const modal = await this.modalCtrl.create({
      component: ChangeThrowsPage,
      componentProps: data2
    });
    await modal.present()
    const { data } = await modal.onWillDismiss();
    data.me.players[data.me.acctualPlayer].points = data.me.points - data.points;
    for (var i = 0; i < data.me.players[data.me.acctualPlayer].dartsThrown.length; i++) {
      if (data.throws[i].points !== data.me.players[data.me.acctualPlayer].dartsThrown[i].points) {
        data.me.players[data.me.acctualPlayer].dartsThrown[i].points = data.throws[i].points;
      }
    }
    data.me.setAvarages();
  }

  delete() {
    var input = this.thrownpoints;
    var newinput = input.substr(0, input.length - 1);
    this.thrownpoints = newinput;
  }

  enter() {
    if (this.thrownpoints == "") {
      this.thrownpoints = 0;
    }
    var points = JSON.parse(this.thrownpoints);
    this.score(points);
    this.thrownpoints = "";
    if (this.desktop === false) {
      this.slides.slideTo(this.game.acctualPlayer, 1000);
    }
  }

  setWayToStart(way) {
    this.wayToStart = way; //true = bullseye; false = reihenfolge
  }

  calculateFinishWay(player, points) {
    this.output = [];
    this.soFar = [];
    this.getWay(points, 3)
    if (this.output.length > 0) {
      this.output = this.sort(this.output, "DartsToFinish")
      this.sortFinishesAfterDarts(this.output);
      var l = this.sortFinishesAfterSingles(this.output);
      if (l) {
        this.output.splice(l, this.output.length);
      }
      this.priority(this.output);
      this.game.players[player].finishTable = this.output;
      var way = this.output[0].Darts.toString();
      this.game.players[player].finishWay = way.split(",").join(" - ");
    } else {
      this.game.players[player].finishTable = [];
      this.game.players[player].finishWay = "-  -  -";
    }
  }

  check(data) {
    var wurf = data.Darts[data.DartsToFinish - 1];
    if (wurf % 2 == 0 && wurf <= 40 || wurf % 2 == 0 && wurf == 50) {
      return true
    } else {
      return false;
    }
  }

  textEdit(dart, finish) {
    if (dart === 50) {
      return "BULL"
    } else if (dart === 25) {
      return "S-BULL"
    } else if (finish === true) {
      return "D" + dart / 2;
    } else if (finish === false && dart > 20 && dart % 3 == 0) {
      return "T" + dart / 3;
    } else if (dart > 20 && dart % 2 == 0) {
      return "D" + dart / 2;
    } else {
      return dart.toString();
    }
  }

  sort(array, key) {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    })
  }

  sortFinishesAfterDarts(array) {
    var last;
    var lastId;
    try {
      for (var i = 0; i < array.length; i++) {
        if (last && array[i].DartsToFinish < last.DartsToFinish) {
          this.switchEntrys(array, i, lastId);
          this.sortFinishesAfterDarts(array);
        }/*
        if (array[i].DartsToFinish === array[0].DartsToFinish || i < 50) {
          if (last && (array[i].Tribles + array[i].Bulls) < (last.Tribles + last.Bulls) && array[i].Singles === last.Singles && array[i].DartsToFinish === last.DartsToFinish) {
            this.switchEntrys(array, i, lastId);
            this.sortFinishes(array);
          } else if (last && (array[i].Tribles + array[i].Bulls) === (last.Tribles + last.Bulls) && array[i].Singles === last.Singles && array[i].DartsToFinish === last.DartsToFinish) {
            if (array[i].Bulls < last.Bulls) {
              this.switchEntrys(array, i, lastId);
              this.sortFinishes(array);
            }
          }
        }*/
        last = array[i];
        lastId = i;
      }
    } catch (error) {
      console.log("Vorsortierungs Fehler")
    }
  }

  sortFinishesAfterSingles(array) {
    var last;
    var lastId;
    for (var i = 0; i < array.length; i++) {
      if (last && array[i].DartsToFinish > last.DartsToFinish) {
        return i;
      } else if (last && array[i].Singles > last.Singles && array[i].Bulls <= last.Bulls && array[i].DartsToFinish === last.DartsToFinish) {
        this.switchEntrys(array, i, lastId);
        this.sortFinishesAfterSingles(array);
      }
      last = array[i];
      lastId = i;
    }
  }

  priority(array) {
    var finish = array[0].DartsToFinish;
    var last;
    var lastId;
    try {
      if (this.settings.getAccountByName(this.game.getAcctualPlayer().getName())) {
        var priorityArray = this.settings.getAccountByName(this.game.getAcctualPlayer().getName()).getDoubles();
      } else {
        priorityArray = this.settings.getDefaultPriority();
      }

      for (var i = 0; i < array.length; i++) {
        if (array[i].DartsToFinish <= finish && last) {
          var actuallIndex = priorityArray.indexOf(array[i].Darts[array[i].DartsToFinish - 1]);
          var lastIndex = priorityArray.indexOf(last.Darts[last.DartsToFinish - 1]);
          if (actuallIndex < lastIndex && actuallIndex !== -1 || lastIndex === -1 && actuallIndex !== -1) {
            if (array[i].Singles <= last.Singles && array[i].Doubles <= last.Doubles) {
              this.switchEntrys(array, i, lastId);
              this.priority(array);
            }
          }
        } else {
          if (last && last.DartsToFinish === array[i].DartsToFinish) {
            var actuallIndex2 = priorityArray.indexOf(array[i].Darts[array[i].DartsToFinish - 1]);
            var lastIndex2 = priorityArray.indexOf(last.Darts[last.DartsToFinish - 1]);
            if (actuallIndex2 < lastIndex2 && actuallIndex2 !== -1 || lastIndex2 === -1 && actuallIndex2 !== -1) {
              if (array[i].Singles <= last.Singles && array[i].Doubles <= last.Doubles) {
                this.switchEntrys(array, i, lastId);
              }
            }
          }
        }
        last = array[i];
        lastId = i;
      }
    } catch (error) {
      console.log("Finsih weg nicht berechenbar")
    }

  }

  switchEntrys(data, switch1, switch2) {
    var temp;
    temp = data[switch1];
    // die werte vertauschen
    data[switch1] = data[switch2];
    data[switch2] = temp;
  }

  getWay(remainingPoints, remainingDarts) {
    if (remainingPoints < 0) {
      return
    }
    if (remainingPoints == 0) {
      this.addToOutput(this.soFar[0], this.soFar[1], this.soFar[2]);
    }
    if (remainingDarts == 0) {
      return
    }
    for (var i = 1; i <= 20; ++i) {
      // try to throw i points
      for (var j = 1; j <= 3; ++j) {
        this.soFar.push(j * i);
        this.getWay(remainingPoints - (j * i), remainingDarts - 1);
        this.soFar.pop();
      }
    }
    for (var h = 1; h <= 2; ++h) {
      this.soFar.push(h * 25);
      this.getWay(remainingPoints - (h * 25), remainingDarts - 1);
      this.soFar.pop();
    }
  }

  addToOutput(dart1, dart2, dart3) {
    var data = { Darts: [dart1, dart2, dart3], DartsToFinish: 0, Tribles: 0, Doubles: 0, Bulls: 0, Singles: 0 };
    if (!dart2) {
      data.Darts.splice(2, 1);
      data.Darts.splice(1, 1);
      data.DartsToFinish = 1;
    } else if (!dart3) {
      data.Darts.splice(2, 1);
      data.DartsToFinish = 2;
    } else {
      data.DartsToFinish = 3;
    }
    if (this.check(data) == false) {
      return;
    }


    for (var h = 0; h < data.Darts.length; h++) {
      if (h + 1 === data.DartsToFinish) {
        data.Darts[h] = this.textEdit(data.Darts[h], true);
        if (data.Darts[h].search("BULL") !== -1) {
          data.Bulls++;
        } else if (data.Darts[h].search("D") !== -1) {
          data.Doubles++;
        }
      } else {
        data.Darts[h] = this.textEdit(data.Darts[h], false);
        if (data.Darts[h].search("T") !== -1) {
          data.Tribles++;
        } else if (data.Darts[h].search("BULL") !== -1) {
          data.Bulls++;
        } else if (data.Darts[h].search("D") !== -1) {
          data.Doubles++;
        } else {
          data.Singles++;
        }
      }
    }

    var found = 0;
    for (var i = 0; i < this.output.length; i++) {
      for (var j = 0; j < data.Darts.length; j++) {
        if (data.Darts[j] === this.output[i].Darts[j]) {
          found++;
        }
      }
      if (found === data.Darts.length) {
        return;
      }
      found = 0;
    }
    this.output.push(data);
  }

  legWon(points: number, darts: number) {
    this.game.getAcctualPlayer().scorePoints(points);
    this.game.getAcctualPlayer().addCheckout(points);
    this.game.addThownDartsForPlayer(points, darts);
    this.game.legWon();
    if (this.game.checkGameWin() === true) {
      this.stats.saveGame();
      this.router.navigate(['/game-stats', { Id: this.game.Id }]);
      return;
    }
    this.game.nextLeg();
    for (var i = 0; i < this.game.players.length; i++) {
      this.calculateFinishWay(i, this.game.players[i].getPoints());
    }
    if (this.desktop === false) {
      this.slides.slideTo(this.game.acctualPlayer, 1000);
    }
  }

  score(points) {
    if (points <= 180) {
      if (this.game.getAcctualPlayer().checkPoints(points) === true) {
        if (this.game.getAcctualPlayer().getPoints() === points) {
          if (this.game.getAcctualPlayer().isFinishPosible() === true) {
            this.presentAlert(points, this);
          } else {
            this.presentToast("Mit 3 Darts nicht möglich")
          }
        } else {
          this.game.getAcctualPlayer().scorePoints(points);
          this.game.addThownDartsForPlayer(points, 3);
          this.calculateFinishWay(this.game.acctualPlayer, this.game.getAcctualPlayer().getPoints());
          this.game.nextPlayer();
        }
      } else {
        //überworfen
        this.presentToast("Überworfen")
        this.game.addThownDartsForPlayer(0, 3);
        this.game.nextPlayer();
      }
    } else {
      this.presentToast("Cheaten geht nit")
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async presentAlert(points, that) {
    var buttons = this.getButtonsForLegWin(points);
    if (buttons.length === 0) {
      this.legWon(points, 3);
      return;
    }
    this.finishDialogOpen = true;
    this.finishDialog = await this.actionSheetController.create({
      header: 'Benötigte Darts',
      cssClass: 'buttonCss',
      buttons: that.getButtonsForLegWin(points)
    });
    await this.finishDialog.present();
  }
  getButtonsForLegWin(points) {
    var minDarts = this.game.getAcctualPlayer().finishTable[0].DartsToFinish;
    var buttons = [];

    if (minDarts === 1) {
      var Button1 = {
        text: '1',
        handler: (event) => {
          this.finishDialogOpen = false;
          this.legWon(points, 1);
        }
      }
      buttons.push(Button1);
    }
    if (minDarts < 3) {
      var Button2 = {
        text: '2',
        handler: (event) => {
          this.finishDialogOpen = false;
          this.legWon(points, 2);
        }
      }
      buttons.push(Button2);
    }
    if (minDarts === 3) {
      return [];
    }
    var Button3 = {
      text: '3',
      cssClass: 'secondary',
      handler: (event) => {
        this.finishDialogOpen = false;
        this.legWon(points, 3);
      }
    }
    buttons.push(Button3);
    return buttons;
  }
  getElement(id: string) {
    return document.getElementById(id);
  }
}
