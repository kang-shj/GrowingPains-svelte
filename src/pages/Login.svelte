<script>
	import {
    Button,
    Table
  } from 'attractions'
	import { user, family } from '../store'
	import api from '../network/api'

  let familys = [];

  function onLogin() {
    api.login("kangsj", "123456").then(response => {
      user.set(response);
    });
  }

  function onFamily() {
    api.getFamily().then(response => {
      familys = response;
    });
  }

</script>

<main id="login-page">
  {#if $user === undefined}
    <Button filled on:click={onLogin}>Login</Button>
  {:else}
    <h1>{$user.name}</h1>
    {#if familys.length <= 0}
      <Button filled on:click={onFamily}>Get Family</Button>
    {:else}
      <Table headers={[
        {text: 'id', value: 'id'},
        {text: '名称', value: 'name'},
        {text: '角色', value: 'role'},
        {text: '标记', value: 'mark'},
      ]} items={familys} />
    {/if}
  {/if}

</main>

<style>
#login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>