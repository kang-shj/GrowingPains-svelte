<script>
  import { onDestroy } from 'svelte'
  import {
    Table,
    RadioButton,
    DropdownShell,
    Dropdown,
    Button,
  } from 'attractions'
  import { ChevronDownIcon } from 'svelte-feather-icons'
  import { user, family, member } from '../store'
  import DropdownButton from '../views/DropdownButton.svelte'
	import api from '../network/api'

  let rules = [];
  let childs = [];
  let curMemberId = 0;
  let score = 0;
  let scorings = [];

  let addRule = undefined;

  const membersubscribe = member.subscribe(value => {
    if (value !== undefined) {
      if (value.roleId === 1) {
        getScore(value.id);
        getScorings(value.id);
      } else if (value.roleId === 2) {
        api.getRules(value.familyId).then(response => {
          rules = response;
        });
        api.getFamilyScores(value.familyId).then(response => {
          childs = response;
        });
      }
    }
  });

  onDestroy(() => {
    membersubscribe();
  });

  function getScore(memberId) {
    api.getScore(memberId).then(response => {
      if (response) {
        score = response.score;
      }
    });
  };

  function getScorings(memberId) {
    api.getScorings(memberId).then(response => {
      scorings = response;
    });
  };

  function transformTime(isoTime) {
    var t = new Date(isoTime);
    return `${t.toLocaleDateString()} ${t.toTimeString().substr(0, 8)}`;
  };

  function makeRuleString(rule) {
    return `${rule.description} - ${rule.scoring}`;
  };

  function selectRule(value) {
    addRule = rules[value.detail];
  };

  function appendRule() {
    api.addScoring(curMemberId, addRule.id).then(response => {
      getScorings(curMemberId);
      addRule = undefined
    });
  };

</script>

<main>
  <h1>{$user !== undefined ? $user.name : ""} - {$family !== undefined ? $family.name : ""} - {$member !== undefined ? $member.roleName : ""}</h1>
  {#if $member !== undefined}
    {#if $member.roleId === 1}
      <div></div>
    {:else if $member.roleId === 2}
      <Table headers={[
        {text: '', value: 'id'},
        {text: '名字', value: 'name'},
        {text: '标记', value: 'mark'},
        {text: '得分', value: 'score'},
      ]} items={childs}>
        <div slot="item" let:header={header} let:item={item}>
          {#if header.value === "id"}
            <RadioButton name="childs" value={item.memberId} on:change={(event) => {
              curMemberId = event.detail.value;
              getScore(curMemberId);
              getScorings(curMemberId);
            }} />
          {:else if header.value === "score" && item[header.value] === null}
            0
          {:else}
            {item[header.value]}
          {/if}
        </div>
      </Table>

    {:else}
      <h1>{$member.roleName}</h1>
    {/if}

    {#if $member.roleId === 2 && curMemberId > 0}
      <div style="display: flex; align-items: center;">
        添加计分：
        <DropdownButton hint="点击选择规则" items={rules.map(rule => `${rule.description}  ${rule.scoring}`)} on:select={selectRule}>
        </DropdownButton>
        <!-- <DropdownShell let:toggle>
          <Button on:click={toggle}>
            {#if addRule === undefined}
              点击选择规则
            {:else}
              {makeRuleString(addRule)}
            {/if}
            <ChevronDownIcon size="24" class="ml dropdown-chevron" />
          </Button>
          <Dropdown>
            {#each rules as rule}
              <Button filled rectangle small on:click={() => addRule = rule}>{makeRuleString(rule)}</Button>
            {/each}
          </Dropdown>
        </DropdownShell> -->
        <Button filled rectangle small on:click={appendRule}>确定</Button>
      </div>
    {/if}
    {#if $member.roleId === 1 || ($member.roleId === 2 && curMemberId > 0)}
      <h1>总得分：{score}</h1>
      <Table headers={[
        {text: '时间', value: 'time'},
        {text: '操作人', value: 'operator'},
        {text: '规则', value: 'rule'},
        {text: '计分', value: 'scoring'},
        {text: '得分', value: 'score'},
      ]} items={scorings}>
        <div slot="item" let:header={header} let:item={item}>
          {#if header.value === "time"}
            {transformTime(item["time"])}
          {:else if header.value === "scoring"}
            {#if item["scoring"] > 0}
              +{item["scoring"]}
            {:else}
              {item["scoring"]}
            {/if}
          {:else}
            {item[header.value]}
          {/if}
        </div>
      </Table>
    {/if}
  {/if}
</main>
