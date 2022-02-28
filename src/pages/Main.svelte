<script>
	import { onMount } from 'svelte'
  import { replace } from "svelte-spa-router"

  import Menu from '../views/Menu.svelte'
  import Home from "./Home.svelte"
	import Rule from './Rule.svelte'
	import User from './User.svelte'

	import { user, family, member } from '../store'
	import api from '../network/api'
	
  let tabs = ["主页", "规则", "用户"];
	let curTab = tabs[0];

	onMount(() => {
		console.log(typeof 1);
		let token = window.localStorage.getItem("token");
		console.log({token});
		if (token === null || token.length <= 0) {
			routerLogin();
		} else {
			api.setToken(token);
			api.getUser().then(response => {
				user.set(response);
				api.getFamilyLink().then(response2 => {
					if (response2) {
						api.getFamily(response2.familyId).then(response3 => {
							family.set(response3);
						});
						api.getFamilyMember(response2.familyId).then(response4 => {
							member.set(response4);
						});
					}
				});
			}).catch(error => {
				routerLogin();
			});
		}
  });

	function routerLogin() {
		replace("/login");
	}

	function onTabChange(value) {
		curTab = value.detail.value;
	}
</script>

<main id="main-page">
	<h1 id="app-title">成长的烦恼</h1>
	<Menu tabs={tabs} curTab={curTab} on:change={onTabChange}>
		{#if curTab === tabs[0]}
      <Home />
		{:else if curTab === tabs[1]}
			<Rule />
		{:else if curTab === tabs[2]}
			<User />
		{:else}
			<h1>Place click tab.</h1>
		{/if}
	</Menu>
</main>

<style>
	/* main {
		text-align: center; */
		/* padding: 1em; */
		/* max-width: 240px; */
		/* margin: 0 auto;
		margin: 24px;
	} */

	#app-title {
		color: violet;
	}

	/* #main-page {

	} */

	/* h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>