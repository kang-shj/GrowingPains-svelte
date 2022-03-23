<script>
  import { onMount } from 'svelte'
  import {
    Button,
    Table,
    Modal,
    Dialog,
    TextField,
    Loading,
    SnackbarContainer,
  } from 'attractions'
  import {
    EditIcon,
    Trash2Icon,
  } from 'svelte-feather-icons'
  import api from "../network/api"
  import { family, member } from '../store';

  let rules = [];
  let openAddRule = false;
  let newRule = {
    description: "",
    scoring: 0,
    remarks: ""
  };
  let openEditRule = false;
  let editRule;
  let openDeleteRule = false;
  let deleteRuleId;

  onMount(() => {
    api.getRules($family.id).then(response => {
      rules = response;
    });
  });

  function onOpenDialog() {
    openAddRule = true;
    newRule = Object.assign(newRule, {
      description: "",
      scoring: 0
    });
  };

  function doEditRule(rule) {
    editRule = rule;
    openEditRule = true;
  };

  function doDeleteRule(rule) {
    // openDeleteRule = true;
    // deleteRuleId = rule.id;
    Snackbar.showSnackbar({
      props: {
        text: 'Delete Rule.'
      }
    });
  }

  function onAddRule() {
    api.addRule($family.id, newRule.description, newRule.scoring, newRule.remarks).then(response => {
      rules.push(newRule);
      rules = rules;
      openAddRule = false;
    });
  };

  let waitEdit = [];
  function onEditRule() {
    openEditRule = false;
    waitEdit.push(editRule.id);
    api.editRule(editRule.id, editRule.description, editRule.scoring, editRule.remarks).then(response => {
      waitEdit.splice(waitEdit.indexOf(editRule.id), 1);
      editRule = undefined;
      Snackbar.showSnackbar({ props: { text: 'Hello!' } });
    });
  }

  let Snackbar;

</script>

<main>
  {#if $member.roleId === 2}
    <Button filled rectangle small on:click={onOpenDialog}>添加规则</Button>
  {/if}

  <Table headers={[
    {text: '规则', value: 'description'},
    {text: '计分', value: 'scoring'},
    {text: '备注', value: 'remarks'},
    {text: '', value: 'actions'}
  ]} bind:items={rules}>
    <div slot="item" let:header={header} let:item={item}>
      {#if header.value === "actions"}
        <div class="app-inline">
          <Button disabled={waitEdit.indexOf(item.id) >= 0} round neutral on:click={doEditRule(item)}>
            {#if waitEdit.indexOf(item.id) < 0}
              <EditIcon size="20" />
            {:else}
              <Loading />
            {/if}
          </Button>
          <Button round neutral on:click={doDeleteRule(item)}>
            <!-- <Trash2Icon size="20" /> -->
            <Loading />
          </Button>
        </div>
      {:else}
        {item[header.value] || ""}
      {/if}
    </div>
  </Table>

  <Modal bind:open={openAddRule}>
    <Dialog title="添加规则">
      规则
      <TextField bind:value={newRule.description}/>
      分数
      <TextField bind:value={newRule.scoring} type="number"/>
      备注
      <TextField bind:value={newRule.remarks}/>
      <Button filled rectangle small on:click={onAddRule}>添加</Button>
    </Dialog>
  </Modal>

  <Modal bind:open={openEditRule}>
    {#if editRule !== undefined}
      <Dialog title="修改规则">
        规则
        <TextField bind:value={editRule.description}/>
        分数
        <TextField bind:value={editRule.scoring} type="number"/>
        备注
        <TextField bind:value={editRule.remarks}/>
        <Button filled rectangle small on:click={onEditRule}>确定</Button>
      </Dialog>
    {/if}
  </Modal>
  
  <SnackbarContainer bind:this={Snackbar} />
</main>

<style>
.app-inline {
  display: flex;
  align-items: center;
}
</style>