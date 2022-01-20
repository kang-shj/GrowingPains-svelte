<script>
  import {location, querystring, pop} from 'svelte-spa-router'
  import { Button } from 'attractions';

</script>

<main>
  <h1>Other Page</h1>
  <p>The current page is: {$location}</p>
  <p>The querystring is: {$querystring}</p>
  <Button filled on:click={() => pop()}>Go Back</Button>
</main>