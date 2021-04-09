import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-start',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
})
export class StartPage {

  constructor(public navCtrl: NavController, public router: Router ) { }

  gameStart() {
    this.router.navigate(['/config-game']);    
  }

  settings() {
    this.router.navigate(['/settings']); 
  }

  tournament() {
    this.router.navigate(['/config-game']); 
  }

  stats() {
    this.router.navigate(['/app/tabs/stats']); 
  }
}
