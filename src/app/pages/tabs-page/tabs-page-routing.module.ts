import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';


const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'stats',
        children: [
          {
            path: '',
            loadChildren: './pages/stats/stats.module#StatsPageModule'
            //loadChildren: () => import('../stats/stats.module').then(m => m.StatsPageModule)
          }
        ]
      },
      {
        path: 'games',
        children: [
          {
            path: '',
            loadChildren: './pages/games/games.module#GamesPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/app/tabs/speakers',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

