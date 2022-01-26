<script>
  import { link, push } from "svelte-spa-router";

  import Menu from '../views/Menu.svelte';
  import Home from "./Home.svelte";
	import One from './One.svelte'
	import Two from './Two.svelte'

	import { Button } from 'attractions';

	// import axios from 'axios';
	// console.log(_axios);
	// axios.defaults.withCredentials = true;

  let tabs = ["Home", "Page One", "Page Two"];
	let curTab = tabs[0];

	let token;

	function onTabChange(value) {
		// console.log({value});
		curTab = value.detail.value;
	}

	async function onLogin() {
		// axios.post("/api/login", {
		// 	username: "kang",
		// 	password: "123456"
		// }).then(function (response) {
		// 	console.log(response.data);
		// });

		fetch('http://localhost:5000/api/login', {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			// credentials: 'same-origin', // include, *same-origin, omit
			// headers: {
			// 	'Content-Type': 'application/json'
			// 	// 'Content-Type': 'application/x-www-form-urlencoded',
			// },
			// redirect: 'follow', // manual, *follow, error
			// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify({
				username: "kang",
				password: "123456"
			}) // body data type must match "Content-Type" header
		}).then(response => response.json()).then(data => {
			console.log('Success:', data);
			token = data.token;
		});

		// console.log({data});
	}

	function onGetUser() {
		fetch('http://localhost:5000/api/user/user', {
			method: 'GET', // *GET, POST, PUT, DELETE, etc.
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			// credentials: 'same-origin', // include, *same-origin, omit
			// headers: {
			// 	// 'Content-Type': 'application/json'
			// 	// 'Content-Type': 'application/x-www-form-urlencoded',
			// 	'Authorization': 'Bearer ' + token
			// },
			// redirect: 'follow', // manual, *follow, error
			// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			// body: JSON.stringify({
			// 	username: "kang",
			// 	password: "123456"
			// }) // body data type must match "Content-Type" header
		}).then(response => response.json()).then(data => {
			console.log('Success:', data);
		})
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