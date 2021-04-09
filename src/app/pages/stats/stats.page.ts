import { Component, OnInit, ViewChild  } from '@angular/core';
import { Stats } from '../../providers/Stats';
import { Settings } from '../../providers/Settings';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {
  @ViewChild('lineChart') lineChart;
  @ViewChild('lineChart2') lineChart2;

  lines: any;
  lines2: any;
  features: any;
  colorArray: any;
  categories: Array<any>;

  constructor(private stats: Stats, private router: Router, private settings: Settings) { }

  ngOnInit() {
    this.getAvarageStats("Jonas");
  }

  closePage() {
    this.router.navigate(['/start']);
  }

  deleteAllGames() {
    this.stats.deleteAllGames();
  }

  getAvarageStats(playername: string) {
    var avarages = {
      games: [],
      avg: []
    };
    var checkouts = {
      games: [],
      percent: []
    }
    this.stats.getGamesFromStorage().then(data => {
      for (var i in data) {
        for (var j=0; j<data[i].players.length; j++) {
          if (data[i].players[j].getName() === playername) {
            avarages.avg.push(data[i].players[j].getAvarageTotal());
            avarages.games.push(avarages.games.length+1);
            checkouts.percent.push(data[i].players[j].getCheckoutPercent());
            checkouts.games.push(avarages.games.length);
          }
        }
      }
      this.createAvarageLineChart(avarages);
      this.createCheckoutPercLineChart(checkouts);
    })
  }

  createAvarageLineChart(avarages) {
    this.lines = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      fill: false,
      data: {
        labels: avarages.games,
        datasets: [{
          label: "Avarage",
          data: avarages.avg,
          borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        aspectRatio: this.settings.getAspectRadio(),
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  createCheckoutPercLineChart(checkouts) {
    this.lines2 = new Chart(this.lineChart2.nativeElement, {
      type: 'line',
      data: {
        labels: checkouts.games,
        datasets: [{
          label: "Checkout %",
          data: checkouts.percent,
          borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        aspectRatio: this.settings.getAspectRadio(),
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

}
