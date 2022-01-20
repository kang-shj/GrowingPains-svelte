<script>
  import { createEventDispatcher } from 'svelte';
	import { Tabs } from 'attractions';

  const dispatch = createEventDispatcher();

  export let tabs;
  export let curTab;

  function changeTab(value, nativeEvent) {
    // console.log({value});
    dispatch("change", {
			value: value.detail.value
		});
  }
</script>

<main>
  <Tabs class="menu-tabs" name="menu" items={tabs} bind:value={curTab}
    on:change={changeTab}
  />
  <slot></slot>
</main>
