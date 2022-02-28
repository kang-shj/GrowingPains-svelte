<script>
  import { createEventDispatcher } from 'svelte';
	import {
    Button,
    Dropdown,
    DropdownShell,
  } from 'attractions'
  import { ChevronDownIcon } from 'svelte-feather-icons'

  export let hint;
  export let items;

  const dispatch = createEventDispatcher();

  let select = ""

  function onSelect(item, index) {
    select = item;
    dispatch("select", index);
  }

</script>

<main>
  <DropdownShell let:toggle>
    <Button on:click={toggle}>
      {#if select.length <= 0}
        {hint}
      {:else}
        {select}
      {/if}
      <ChevronDownIcon size="24" class="ml dropdown-chevron" />
    </Button>
    <Dropdown>
      <!-- 规则列表 -->
      <div class="dropdown-menu">
        {#each items as item, index}
          <div class="dropdown-item" on:click={() => {onSelect(item, index)}}>
            <slot name="item" {item}>
              {item}
            </slot>
          </div>
          <!-- <Button filled rectangle small on:click={() => {}}>{item.toString()}</Button> -->
        {/each}
      </div>
    </Dropdown>
  </DropdownShell>
</main>

<style>
  .dropdown-menu {
    margin: 20px 0;
  }

  .dropdown-item {
    padding: 10px;
  }

  .dropdown-item:hover {
    background-color: blueviolet
  }
</style>