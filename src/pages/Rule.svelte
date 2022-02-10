<script>
  import { onMount } from 'svelte'
	import {
    Button,
    Table,
    Modal,
    Dialog,
    TextField
  } from 'attractions'
  import api from "../network/api"

  let rules = [];
  let openAddRule = false;
  let newRule = {
    description: "",
    scoring: 0
  };

  onMount(() => {
    api.getRules(1).then(response => {
      if (response) {
        rules = response;
      }
    });
  });

  function onOpenDialog() {
    openAddRule = true;
    newRule = Object.assign(newRule, {
      description: "",
      scoring: 0
    });
  };

  function onAddRule() {
    api.addRule(1, newRule.description, newRule.scoring).then(response => {
      rules.push(newRule);
      rules = rules;
      openAddRule = false;
    });
  };

</script>

<main>
  <Table headers={[
    {text: '', value: 'description'},
    {text: '', value: 'scoring'},
  ]} bind:items={rules} />
  <Button filled rectangle small on:click={onOpenDialog}>添加规则</Button>
  <Modal bind:open={openAddRule}>
    <Dialog title="添加规则">
      规则
      <TextField bind:value={newRule.description}/>
      分数
      <TextField bind:value={newRule.scoring} type="number"/>
      <Button filled rectangle small on:click={onAddRule}>添加</Button>
    </Dialog>
  </Modal>
</main>