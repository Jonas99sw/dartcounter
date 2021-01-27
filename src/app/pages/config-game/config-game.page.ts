import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

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
  names: Array<{ id: number, name: string }>;

  constructor(public navCtrl: NavController, public router: Router, public storage: Storage) {
    this.sets = 1;
    this.pointscount = 501
    this.legs = 2;
    storage.get('names').then((val) => {
      if (val !== undefined && val.length > 0) {
        this.names = val;
      } else {
        this.names = [{ id: 1, name: "Spieler-1" }, { id: 2, name: "Spieler 2" }];
      }
      this.players = [{ name: this.names[0].name }, { name: this.names[1].name }];
    });
  }

  removePlayer(player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  closePage() {
    this.router.navigate(['/start']);
  }

  addPlayer() {
    /*$scope.data = {};
 
    $scope.submit = function(){
        var link = 'http://nikola-breznjak.com/_testings/ionicPHP/api.php';
 
        $http.post(link, {username : $scope.data.username}).then(function (res){
            $scope.response = res.data;
        });
    };*/
    /*var name: string;
    if (this.names[this.players.length]) {
      name = this.names[this.players.length].name;
    } else {
      name = this.names[0].name
    }
    this.players.push({ name: name });*/
  }

  startGame() {
    var names = [];
    for (var i = 0; i < this.players.length; i++) {
      names.push(this.players[i].name);
    }
    var settings = {
      Players: names,
      Sets: this.sets,
      Legs: this.legs,
      Points: this.pointscount
    };

    if (names.length == 0) {

    } else {
      this.router.navigate(['/game', settings]);
    }
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
