<script>
  import {
    Table,
    RadioButton,
  } from 'attractions'
  import { user, family, member } from '../store'
	import api from '../network/api'

  let childs = [];
  let childId = 0;

  let scorings = [];

  const membersubscribe = member.subscribe(value => {
    if (value !== undefined) {
      if (value.roleId === 2) {
        api.getFamilyMembers(value.familyId, 1).then(response => {
          childs = response;
        });
      }
    }
  });

  function getScoring() {

  }

</script>

<main>
  <h1>{$user !== undefined ? $user.name : ""} - {$family !== undefined ? $family.name : ""} - {$member !== undefined ? $member.roleName : ""}</h1>
  {#if $member !== undefined}
    {#if $member.roleId === 1}
      <h1>child</h1>
    {:else if $member.roleId === 2}
      <h1>parent</h1>
      <!-- {#each childs as child}
        {child.userName}
      {/each} -->
      <Table headers={[
        {text: '', value: 'id'},
        {text: '名字', value: 'userName'},
        {text: '标记', value: 'mark'},
      ]} items={childs}>
        <div slot="item" let:header={header} let:item={item}>
          {#if header.value === "id"}
            <RadioButton name="childs" value={item.userId} on:change={(event) => {
              console.log({event});
              childId = event.detail.value;
              getScoring();
            }} />
          {:else}
            {item[header.value]}
          {/if}
        </div>
      </Table>
      {#if childId > 0}

      {/if}
    {:else}
      <h1>{$member.roleName}</h1>
    {/if}
  {/if}
</main>
