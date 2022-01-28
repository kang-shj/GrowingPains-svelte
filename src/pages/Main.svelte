<script>
  import { link, push } from "svelte-spa-router";

  import Menu from '../views/Menu.svelte';
  import Home from "./Home.svelte";
	import One from './One.svelte'
	import Two from './Two.svelte'

	import { Button } from 'attractions';

	import api from '../network/api'

  let tabs = ["Home", "Page One", "Page Two"];
	let curTab = tabs[0];

	function onTabChange(value) {
		curTab = value.detail.value;
	}

	function onLogin() {
		api.login("kang", "123456").then(response => {
			console.log(response);
		});
	}

	function onGetUser() {
		api.getUser().then(response => {
			console.log({response});
		});
	}
</script>

<main>
	<Menu tabs={tabs} curTab={curTab} on:change={onTabChange}>
		{#if curTab === "Home"}
      <Home />
		{:else if curTab === "Page One"}
			<One />
		{:else if curTab === "Page Two"}
			<Two />
		{:else}
			<h1>Place click tab.</h1>
		{/if}
	</Menu>
  <Button filled on:click={() => push("/other")}>Go To Other Page</Button>
  <Button filled on:click={onLogin}>Login</Button>
  <Button filled on:click={onGetUser}>Get User</Button>
  <!-- <a href="/other" use:link>click me</a> -->
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>