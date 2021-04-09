import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', loadChildren: './pages/start/start.module#StartPageModule' },
  { path: 'game', loadChildren: './pages/game/game.module#GamePageModule' },
  { path: 'settings', loadChildren: './pages/settings/settings.module#SettingsPageModule' },
  { path: 'config-game', loadChildren: './pages/config-game/config-game.module#ConfigGamePageModule' },
  { path: 'game-stats/:gameId', loadChildren: './pages/game-stats/game-stats.module#GameStatsPageModule' },
  { path: 'app', loadChildren: './pages/tabs-page/tabs-page.module#TabsModule' },
  { path: 'stats', loadChildren: './pages/stats/stats.module#StatsPageModule' },
  { path: 'games', loadChildren: './pages/games/games.module#GamesPageModule' },
  //{ path: 'change-throws', loadChildren: './pages/change-throws/change-throws.module#ChangeThrowsPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
