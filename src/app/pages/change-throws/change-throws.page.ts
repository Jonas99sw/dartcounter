import { Component } from '@angular/core';
import { NavParams, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-change-throws',
  templateUrl: './change-throws.page.html',
  styleUrls: ['./change-throws.page.scss'],
})
export class ChangeThrowsPage {

  throws: Array<{id: number, points: number}>;
  throwsShow: Array<{id: number, points: number, viewid: number}>;
  edit: number;
  moin: any;
  totalpoints: number = 0;
  newtotalpoint: number = 0;
  that: any;

  constructor(public navParams: NavParams, public modalController: ModalController, public toastController: ToastController) {
    var throws = navParams.data.player.dartsThrown;
    var leg = navParams.data.leg;
    this.that = navParams.data.that;
    this.throws = [];
    this.throwsShow = [];
    for (var i=0; i < throws.length; i++) {
      this.throws.push({id: i, points: throws[i].points});
      if (throws[i].leg === leg) {
        this.totalpoints += throws[i].points;
        this.throwsShow.push({id: i, points: throws[i].points, viewid: this.throwsShow.length});
      }
    }
  }

  change(wurf) {
    var value = (event as any).target.value;
    if (value<=180 && value >= 0) {
      if (value != "") {
      var difference = value - this.throws[wurf.id].points;
      this.newtotalpoint += difference;
      this.throws[wurf.id].points = JSON.parse(value);
      this.throwsShow[wurf.viewid].points = JSON.parse(value);
      }
    } else {
      this.presentToast("Ungültiger Wert")
    }

  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  closepage() {
    var thrownpoints = this.totalpoints + this.newtotalpoint;
    var data = {
      points: thrownpoints,
      me: this.that,
      throws: this.throws
    }
    this.modalController.dismiss(data);
  }

}
