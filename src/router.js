import { wrap } from 'svelte-spa-router/wrap'
import MainPage from './pages/Main.svelte'
import UserPage from './pages/User.svelte'
import OtherPage from './pages/Other.svelte'

export const routes = {
  '/': MainPage,
  // '/login': wrap({asyncComponent: () => import('./pages/User.svelte')}),
  '/login': UserPage,
//   '/other': wrap({
//     asyncComponent: () => import('./pages/Other.svelte')
//   }),
  '/other': OtherPage,
}

// https://www.npmjs.com/package/svelte-spa-router
// https://github.com/ItalyPaleAle/svelte-spa-router