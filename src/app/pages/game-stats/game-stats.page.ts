import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Stats } from '../../providers/Stats';
import { Settings } from '../../providers/Settings';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.page.html',
  styleUrls: ['./game-stats.page.scss'],
})
export class GameStatsPage implements OnInit {
  @ViewChild('lineChart') lineChart;
  @ViewChild('barChart') barChart;
  lines: any;
  bar: any;
  statsToShow: any;
  quickStats: Array<any>;
  game: any;
  title: string;
  secondtitle: string;
  chartData: any;
  rows: Array<any>;
  constructor(public router: Router, public route: ActivatedRoute, private stats: Stats, private settings: Settings) {
    this.title = "";
    this.secondtitle = "";
  }

  ionViewDidEnter() {
    const gameId = this.route.snapshot.paramMap.get('gameId');
    this.stats.getGamesFromStorage().then((result) => {
      this.game = result[gameId];
      this.addAvarageForLineChart();
      this.buildStats();
      this.buildQuickStats();
      this.buildTitle();
      this.secondtitle = this.getWinText(this.game);
      this.createAvarageLineChart();
      this.createScoringRadarChart();
    });
  }

  buildQuickStats() {
    this.quickStats = [];
    var c = "";
    var Columns = [];
    [1, 2, 3, 4, 5].forEach(function (a) {
      for (var i = 0; i < this.game.players.length; i++) {
        switch (a) {
          case 1:
            Columns.push({ text: this.game.players[i].name, class: "header" });
            break;
          case 2:
            Columns.push({ text: "Avarage:", text2: this.game.players[i].avarageTotal, class2: c });
            break;
          case 3:
            Columns.push({ text: "Checkout %:", text2: this.game.players[i].getCheckoutPercent() + "%", class2: c });
            break;
          case 4:
            Columns.push({ text: "Highest Checkout:", text2: this.game.players[i].getHighestCheckout(), class2: c });
            break;
          case 5:
          Columns.push({ text: "Scoring Avarage:", text2: this.game.players[i].scoringAvarage, class2: c });
        }
      }
      if (a !== 1) this.checkHigher(Columns);
      this.quickStats.push({ Columns: Columns });
      Columns = [];
    }.bind(this));
  }

  checkHigher(Columns) {
    var highest = 0;
    for (var i = 0; i < Columns.length; i++) {
      if (parseFloat(Columns[i].text2) > highest) {
        highest = parseFloat(Columns[i].text2);
        Columns[i].class2 = "green";
        for (var j = 0; j < Columns.length; j++) {
          if (j !== i) {
            Columns[j].class2 = "";
          }
        }
      }
    }
  }
  ngOnInit() {
  }
  buildTitle() {
    this.title = "";
    for (var i = 0; i < this.game.players.length; i++) {
      if (i + 1 === this.game.players.length) {
        this.title += this.game.players[i].name
      } else {
        this.title += this.game.players[i].name + " VS ";
      }
    }
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
  buildStats() {
    this.rows = [];
    this.rows.push({ Columns: this.getFirstLine() });
    this.rows.push({ Columns: this.getAvarages() });
    this.getSetAndLegAvarages();
    //this.getThrownPoints();
    //this.getCheckoutStats();
  }

  getFirstLine() {
    var line = [];
    line.push(this.getColumn("Stats", 4));
    for (var i = 0; i < this.game.players.length; i++) {
      line.push(this.getColumn(this.game.players[i].getName(), 4));
    }
    return line;
  }

  getAvarages() {
    var line = [];
    line.push(this.getColumn("Avarage", 4));
    for (var i = 0; i < this.game.players.length; i++) {
      line.push(this.getColumn(this.game.players[i].getAvarageTotal(), 4));
    }
    return line;
  }

  addAvarageForLineChart() {
    this.chartData = { labels: [], datasets: [] };
    for (var i = 0; i < this.game.players.length; i++) {
      var c = this.settings.colors[i];
      var obj = {
        fill: false,
        label: this.game.players[i].name,
        data: [],
        backgroundColor: c,
        borderColor: c,
        borderWidth: 2
      }
      this.chartData.datasets.push(obj)
    }
  }

  getOptions(): object {
    var desktop = this.settings.isDesktop();
    return {
      responsive: true,
      aspectRatio: this.settings.getAspectRadio(),
      tooltips: {
        enabled: desktop === false ? true : false
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;
          ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = "#666666";
          if (desktop === true) {
            this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              if (meta.hidden === true) {
                return;
              }
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        }
      }
    }
  }

  createAvarageLineChart() {
    this.lines = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      fill: false,
      data: {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets
      },
      options: this.getOptions()
    });
  }

  createScoringRadarChart() {
    var labels = [];
    var dataset = [];
    for (var k = 0; k < this.game.players.length; k++) {
      dataset.push({
        label: this.game.players[k].name,
        backgroundColor: this.settings.colors[k],
        borderColor: this.settings.colors[k],
        data: []
      })
    }
    for (var i = 0; i < this.game.players[0].statsInfo.length; i++) {
      labels.push(this.game.players[0].statsInfo[i].point + "+");
      for (var j = 0; j < this.game.players.length; j++) {
        dataset[j].data.push(this.game.players[j].statsInfo[i].count);
      }
    }

    this.bar = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataset
      },
      options: this.getOptions()
    })
  }

  getSetAndLegAvarages() {
    var line = [];
    if (this.game.setsToWin > 1) {
      for (var i = 1; i <= this.game.getPlayedSetsLength(); i++) {
        line.push(this.getColumn("Avarage Set " + i, 4))
        for (var j = 0; j < this.game.players.length; j++) {
          line.push(this.getColumn(this.game.players[j].Sets[i].Avarage, 4));
        }
        this.rows.push({ Columns: line });
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
    for (var i = 1; i <= this.game.getPlayedLegsForSetLength(set); i++) {
      this.chartData.labels.push("Leg " + (this.chartData.labels.length + 1));
      line.push(this.getColumn("Avarage Leg " + i, 4))
      for (var j = 0; j < this.game.players.length; j++) {
        this.chartData.datasets[j].data.push(this.game.players[j].Sets[set].Legs[i].Avarage);
        line.push(this.getColumn(this.game.players[j].Sets[set].Legs[i].Avarage, 4));
      }
      this.rows.push({ Columns: line });
      line = [];
    }
  }

  getThrownPoints() {
    var line = [];
    this.addClearLine()
    for (var i = 0; i < this.game.players[0].statsInfo.length; i++) {
      line.push(this.getColumn(this.game.players[0].statsInfo[i].point + "+", 4))
      for (var j = 0; j < this.game.players.length; j++) {
        line.push(this.getColumn(this.game.players[j].statsInfo[i].count, 4));
      }
      this.rows.push({ Columns: line });
      line = [];
    }
  }

  getCheckoutStats() {
    var line = [];
    this.addClearLine();
    line.push(this.getColumn("Highest Checkout", 4));
    for (var j = 0; j < this.game.players.length; j++) {
      line.push(this.getColumn(this.game.players[j].getHighestCheckout(), 4));
    }
    this.rows.push({ Columns: line });
    line = [];
    line.push(this.getColumn("Checkout %", 4));
    for (var j = 0; j < this.game.players.length; j++) {
      line.push(this.getColumn(this.game.players[j].getCheckoutPercent().toString() + "%", 4));
    }
    this.rows.push({ Columns: line });
  }

  getColor(row, column) {
    if (row.Columns[0].text.search("rage") !== -1 || row.Columns[0].text.search("0+") !== -1 || row.Columns[0].text.search("out") !== -1) {
      if (row.Columns[1].text === column.text && parseFloat(column.text) > parseFloat(row.Columns[2].text)) {
        return "green";
      } else if (row.Columns[2].text === column.text && parseFloat(column.text) > parseFloat(row.Columns[1].text)) {
        return "green";
      }
    }
  }

  getColumn(text: any, size: number) {
    return {
      text: text,
      size: size
    }
  }

  addClearLine() {
    this.rows.push({ Columns: [this.getColumn("", 4), this.getColumn("", 4), this.getColumn("", 4)] });
  }

  routeToStart() {
    this.router.navigate(['/start']);
  }

}
