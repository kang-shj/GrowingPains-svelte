import { wrap } from 'svelte-spa-router/wrap'
import MainPage from './pages/Main.svelte';
import OtherPage from './pages/Other.svelte';

export const routes = {
  '/': MainPage,
  '/other': OtherPage,
  '/other_async': wrap({
    asyncComponent: () => import('pages/Other.svelte')
  }),
}

// https://www.npmjs.com/package/svelte-spa-router
// https://github.com/ItalyPaleAle/svelte-spa-router