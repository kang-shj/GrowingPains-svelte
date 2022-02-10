import { wrap } from 'svelte-spa-router/wrap'
import LoginPage from './pages/Login.svelte'
import MainPage from './pages/Main.svelte'
import OtherPage from './pages/Other.svelte'

export const routes = {
  '/': MainPage,
  // '/login': wrap({asyncComponent: () => import('./pages/Login.svelte')}),
  '/login': LoginPage,
//   '/other': wrap({
//     asyncComponent: () => import('./pages/Other.svelte')
//   }),
  '/other': OtherPage,
}

// https://www.npmjs.com/package/svelte-spa-router
// https://github.com/ItalyPaleAle/svelte-spa-router