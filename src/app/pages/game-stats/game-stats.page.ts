import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Stats } from '../../providers/Stats';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.page.html',
  styleUrls: ['./game-stats.page.scss'],
})
export class GameStatsPage implements OnInit {
  statsToShow: any;
  game: any;
  title: string;
  rows: Array<any>;
  constructor(public router: Router, public route: ActivatedRoute, private stats: Stats) {
    this.title = "";
    this.route.params.subscribe(params => {
      var gameId = JSON.parse(params.Id);
      stats.getGameFromStorage(gameId).then((result) => {
        this.game = result;
        this.buildStats();
        this.buildTitle();
      });
    });
   }

  ngOnInit() {
  }
  buildTitle() {
    for (var i=0; i<this.game.players.length; i++) {
      if (i+1 === this.game.players.length) {
        this.title += this.game.players[i].name
      } else {
        this.title += this.game.players[i].name + " VS ";
      }
      
    }
  }
  buildStats() {
    this.rows = [];
    this.rows.push({Columns: this.getFirstLine()});
    this.rows.push({Columns: this.getAvarages()});
    this.getSetAndLegAvarages();
    this.getThrownPoints();
    this.getCheckoutStats();
  }
  
  getFirstLine() {
    var line = [];
    line.push(this.getColumn("Stats", 4));
    for (var i=0; i < this.game.players.length; i++) {
      line.push(this.getColumn(this.game.players[i].getName(), 4));
    }
    return line;
  }

  getAvarages() {
    var line = [];
    line.push(this.getColumn("Avarage", 4));
    for (var i=0; i < this.game.players.length; i++) {
      line.push(this.getColumn(this.game.players[i].getAvarageTotal(), 4));
    }
    return line;
  }

  getSetAndLegAvarages() {
    var line = [];
    if (this.game.setsToWin > 1) {
      for (var i=1; i<=this.game.getPlayedSetsLength(); i++) {
        line.push(this.getColumn("Avarage Set "+i, 4))
        for (var j=0; j < this.game.players.length; j++) {
          line.push(this.getColumn(this.game.players[j].Sets[i].Avarage, 4));
        }
        this.rows.push({Columns: line});
        line = [];
        this.getLegAvaragesfromSet(i);
        if (i < this.game.getPlayedSetsLength()) {
          this.addClearLine()
        }
      }
    } else {
      this.getLegAvaragesfromSet(1);
    }
  }

  getLegAvaragesfromSet(set: number) {
    var line = [];
    for (var i=1; i<=this.game.getPlayedLegsForSetLength(set); i++) {
      line.push(this.getColumn("Avarage Leg "+i, 4))
      for (var j=0; j < this.game.players.length; j++) {
        line.push(this.getColumn(this.game.players[j].Sets[set].Legs[i].Avarage, 4));
      }
      this.rows.push({Columns: line});
      line = [];
    }
  }

  getThrownPoints() {
    var line = [];
    this.addClearLine()
    for (var i=0; i<this.game.players[0].statsInfo.length; i++) {
      line.push(this.getColumn(this.game.players[0].statsInfo[i].point + "+", 4))
      for (var j=0; j < this.game.players.length; j++) {
        line.push(this.getColumn(this.game.players[j].statsInfo[i].count, 4));
      }
      this.rows.push({Columns: line});
      line = [];
    }
  }

  getCheckoutStats() {
    var line = [];
    this.addClearLine();
    line.push(this.getColumn("Highest Checkout", 4));
    for (var j=0; j < this.game.players.length; j++) {
      var checkout = 0;
      for (var i=0; i<this.game.players[j].checkouts.length; i++) {
        if (this.game.players[j].checkouts[i] > checkout) {
          checkout = this.game.players[j].checkouts[i];
        }
      }
      line.push(this.getColumn(checkout.toString(), 4));
    }
    this.rows.push({Columns: line});
    line = [];
    line.push(this.getColumn("Checkout %", 4));
    for (var j=0; j < this.game.players.length; j++) {
      var checkoutPercent = Math.round((this.game.players[j].totalLegWins*100) / this.game.players[j].checkoutChances * 100) / 100
      line.push(this.getColumn(checkoutPercent.toString() + "%", 4));
    }
    this.rows.push({Columns: line});
  }

  getColor(row, column) {
    if (row.Columns[0].text.search("rage") !== -1 || row.Columns[0].text.search("0+") !== -1 || row.Columns[0].text.search("out") !== -1) {
      if (row.Columns[1].text === column.text && column.text > row.Columns[2].text) {
        return "#BADB01";
      } else if (row.Columns[2].text === column.text && column.text > row.Columns[1].text) {
        return "#BADB01";
      }
    }
  }

  getColumn(text: string, size: number) {
    return {
      text: text,
      size: size
    }
  }

  addClearLine() {
    this.rows.push({Columns: [this.getColumn("", 4), this.getColumn("", 4), this.getColumn("", 4)]});
  }

  routeToStart() {
      this.router.navigate(['/start']);
  }

}
