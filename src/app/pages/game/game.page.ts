import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, ModalController, AlertController, IonSlides } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
//import { PowerManagement } from '@ionic-native/power-management/ngx';
import { ChangeThrowsPage } from '../change-throws/change-throws.page';
import { modelGroupProvider } from '@angular/forms/src/directives/ng_model_group';

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
  acctualPlayer: number;
  acctualLeg: number;
  legsToWin: number;
  acctualSet: number;
  setsToWin: number;
  points: number;
  wayToStart: boolean;
  thrownpoints: any;
  output = [];
  soFar = [];
  priorityArray = ["D20", "D16", "D18", "D10", "D8", "BULL", "D12", "D4", "D2", "D1", "D9", "D7"];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public router: Router,
    public toastController: ToastController, public modalCtrl: ModalController, private route: ActivatedRoute) {
    this.thrownpoints = "";
    this.acctualSet = 0;
    this.acctualLeg = 0;
    this.acctualPlayer = 0;
    this.wayToStart = false;
    this.players = [];
    this.route.params.subscribe(params => {
      this.legsToWin = JSON.parse(params.Legs);
      this.setsToWin = JSON.parse(params.Sets);
      this.points = JSON.parse(params.Points);
      this.addPlayer(params.Players.split(","));
      this.startGame();
    });
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
    if (this.players[this.acctualPlayer].finishTable[0]) {
      var subTitle = "";
      for (var i = 0; addedEntrys < waystoShow; i++) {
        if (this.players[this.acctualPlayer].finishTable.length == i) {
          break;
        }
        var dartslength = this.players[this.acctualPlayer].finishTable[i].Darts.length
        var way = this.players[this.acctualPlayer].finishTable[i].Darts.toString();
        if (finishDart === this.players[this.acctualPlayer].finishTable[i].Darts[dartslength - 1]) {
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
        finishDart = this.players[this.acctualPlayer].finishTable[i].Darts[dartslength - 1];
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
      player: this.players[this.acctualPlayer],
      leg: this.acctualLeg,
      that: this
    }
    this.showThrownDarts();
  }

  async showThrownDarts() {
    var data2 = {
      player: this.players[this.acctualPlayer],
      leg: this.acctualLeg,
      that: this
    }

    const modal = await this.modalCtrl.create({
      component: ChangeThrowsPage,
      componentProps: data2
    });
    await modal.present()
    const { data } = await modal.onWillDismiss();
    data.me.players[data.me.acctualPlayer].points = data.me.points - data.points;
    for (var i=0; i < data.me.players[data.me.acctualPlayer].dartsThrown.length; i++) {
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
    this.slides.slideTo(this.acctualPlayer, 1000);
  }

  getPlayer() {
    return this.players;
  }

  addPlayer(players) {
    for (var i = 0; i < players.length; i++) {
      this.players.push({
        name: players[i],
        points: this.points,
        legsWon: 0,
        setsWon: 0,
        avarageTotal: 0,
        avarageLeg: 0,
        avarageSet: 0,
        dartsThrown: [],
        finishWay: "-  -  -",
        finishTable: []
      })
    }
  }
  setWayToStart(way) {
    this.wayToStart = way; //true = bullseye; false = reihenfolge
  }

  calculateFinishWay(points) {
    this.output = [];
    this.soFar = [];
    this.getWay(points, 3)
    this.sort(this.output, "DartsToFinish")
    if (this.output[0]) {
      this.priority(this.output);
      this.players[this.acctualPlayer].finishTable = this.output;
      var way = this.output[0].Darts.toString();
      this.players[this.acctualPlayer].finishWay = way.split(",").join(" - ");
    } else {
      this.players[this.acctualPlayer].finishTable = [];
      this.players[this.acctualPlayer].finishWay = "-  -  -";
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
      return "S-Bull"
    } else if (finish === true) {
      return "D" + dart / 2;
    } else if (finish === false && dart > 20 && dart % 3 == 0) {
      return "T" + dart / 3;
    } else if (dart > 20 && dart % 2 == 0) {
      return "D" + dart / 2;
    } else {
      return dart;
    }
  }

  sort(array, key) {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    })
  }

  priority(array) {
    var finish = array[0].DartsToFinish;
    var last;
    var lastId;
    for (var i = 0; i < array.length; i++) {
      if (array[i].DartsToFinish <= finish && last) {
        var actuallIndex = this.priorityArray.indexOf(array[i].Darts[array[i].DartsToFinish - 1]);
        var lastIndex = this.priorityArray.indexOf(last.Darts[last.DartsToFinish - 1]);
        if (actuallIndex < lastIndex && actuallIndex !== -1 || lastIndex === -1 && actuallIndex !== -1) {
          this.switchEntrys(array, i, lastId);
          this.priority(array);
        }
      } else {
        if (last && last.DartsToFinish === array[i].DartsToFinish) {
          var actuallIndex2 = this.priorityArray.indexOf(array[i].Darts[array[i].DartsToFinish - 1]);
          var lastIndex2 = this.priorityArray.indexOf(last.Darts[last.DartsToFinish - 1]);
          if (actuallIndex2 < lastIndex2 && actuallIndex2 !== -1 || lastIndex2 === -1 && actuallIndex2 !== -1) {
            this.switchEntrys(array, i, lastId);
          }
        }
      }
      last = array[i];
      lastId = i;
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

    var data = { Darts: [dart1, dart2, dart3], DartsToFinish: 0, Sort: 1 };
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
      } else {
        data.Darts[h] = this.textEdit(data.Darts[h], false);
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

  addThrowDarts(points) {
    this.players[this.acctualPlayer].dartsThrown.push({
      leg: this.acctualLeg,
      set: this.acctualSet,
      points: points
    });
  }

  nextLeg() {
    for (var i = 0; i < this.getPlayer().length; i++) {
      this.getPlayer()[i].points = this.points
    }
    this.acctualLeg++;
    this.calculateFinishWay(this.points);
    this.nextPlayer();
  }

  legWon(points) {
    this.players[this.acctualPlayer].points = 0;
    this.addThrowDarts(points);
    this.setAvarages();
    this.players[this.acctualPlayer].legsWon++;
    this.checkSetWin();
  }

  checkSetWin() {
    if (this.players[this.acctualPlayer].legsWon === this.legsToWin) {
      this.players[this.acctualPlayer].setsWon++;
      this.acctualSet++;
      for (var i = 0; i < this.players.length; i++) {
        this.players[i].legsWon = 0;
      }
      this.checkGameWin();
    }
  }

  checkGameWin() {
    if (this.players[this.acctualPlayer].setsWon === this.setsToWin) {
      this.showWinDialog();
    }
  }

  async showWinDialog() {
    var game = this;
    const alert = await this.alertCtrl.create({
      header: 'Game gewonnen',
      message: 'Herzlichen Glückwunsch du hast gewonnen /n mit einem Avarage von '+this.players[this.acctualPlayer].avarageTotal,
      buttons: [{
        text: 'Okay',
        handler: () => {
          this.router.navigateByUrl('/start');
        }
      },{
        text: 'Statistiken anzeigen',
        handler: () => {
          this.router.navigateByUrl('/start');
        }
      }]
    });
    await alert.present();
  }

  score(points) {
    if (points <= 180) {
      if (this.players[this.acctualPlayer].points >= points && (this.players[this.acctualPlayer].points-points >=2
          || this.players[this.acctualPlayer].points === points)) {
        if (this.players[this.acctualPlayer].points === points) {
          if (this.players[this.acctualPlayer].finishTable.length > 0) {
            this.presentAlert(points, this);
          } else {
            this.presentToast("Mit 3 Darts nicht möglich")
          } 
        } else {
          this.players[this.acctualPlayer].points = this.players[this.acctualPlayer].points - points;
          this.addThrowDarts(points);
          this.setAvarages();
          this.calculateFinishWay(this.players[this.acctualPlayer].points);
          this.nextPlayer();
        }
      } else {
        //überworfen
        this.presentToast("Überworfen")
        this.addThrowDarts(0);
        this.setAvarages();
        this.nextPlayer();
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
    const alert = await this.alertCtrl.create({
      message: '<strong>Doppel geworfen?</strong>',
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Ja',
          handler: () => {
            that.legWon(points);
            that.nextLeg();
          }
        }
      ]
    });
    await alert.present();
  }

  nextPlayer() {
    this.acctualPlayer++;
    if (this.getPlayer().length === this.acctualPlayer) {
      this.acctualPlayer = 0;
    }
    this.showData();
  }

  setAvarages() {
    var setPoints = 0;
    var legPoints = 0;
    var totalPoints = 0;
    var setCounter = 0, legCounter = 0, totalCounter = 0;
    for (var i = 0; i < this.players[this.acctualPlayer].dartsThrown.length; i++) {
      totalPoints = totalPoints + this.players[this.acctualPlayer].dartsThrown[i].points;
      totalCounter++;
      if (this.acctualSet === this.players[this.acctualPlayer].dartsThrown[i].set) {
        setPoints = setPoints + this.players[this.acctualPlayer].dartsThrown[i].points;
        setCounter++;
      }
      if (this.acctualLeg === this.players[this.acctualPlayer].dartsThrown[i].leg) {
        legPoints = legPoints + this.players[this.acctualPlayer].dartsThrown[i].points;
        legCounter++
      }
      this.players[this.acctualPlayer].avarageTotal = (Math.round(totalPoints / totalCounter * 100) / 100);
      this.players[this.acctualPlayer].avarageLeg = (Math.round(legPoints / legCounter * 100) / 100);
      this.players[this.acctualPlayer].avarageSet = (Math.round(setPoints / setCounter * 100) / 100);
    }

  }

  showData = function () {
    this.actuallPlayerM = this.getPlayer()[this.acctualPlayer].name;
    this.actuallPointsM = this.getPlayer()[this.acctualPlayer].points.toString();
    this.avarageM = this.getPlayer()[this.acctualPlayer].avarageLeg.toString();
    this.sets_wonM = this.getPlayer()[this.acctualPlayer].setsWon.toString();
    this.legs_wonM = this.getPlayer()[this.acctualPlayer].legsWon.toString();
  }

  startGame() {
    (window as any).powerManagement.acquire(function() {
      console.log('Wakelock acquired');
    }, function() {
      console.log('Failed to acquire wakelock');
    });
    this.acctualLeg++;
    this.acctualSet++;
    this.acctualPlayer = 0;
    this.showData();
  }

  getElement(id: string) {
    return document.getElementById(id);
  }

}
