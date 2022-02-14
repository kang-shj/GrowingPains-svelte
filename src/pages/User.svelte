<script>
	import { onMount } from 'svelte'
	import {
    Button,
    Table,
    TextField,
    Modal,
    Dialog,
    RadioButton,
    Divider,
  } from 'attractions'
	import { user, family } from '../store'
	import api from '../network/api'

  let loginUser = {
    username: "kangsj",
    password: "123456"
  };

  let familyLink = 7;
  let familys = [];
  let openCreateFamily = false;
  let newFamily = {
    name: "",
    mark: ""
  }

  onMount(() => {
    if($user !== undefined) {
      onGetFamilys();
    }
  });

  function onRegister() {
    api.register(loginUser.username, loginUser.password).then(response => {
      if (response.userId > 0) {
        user.set({
          id: response.userId,
          name: loginUser.username
        });
      }
    });
  }

  function onLogin() {
    api.login(loginUser.username, loginUser.password).then(async response => {
      user.set(response);
      var links = await api.getFamilyLink();
      if (links.length <= 0) {
        onGetFamilys();
      } else {
        family.set(await api.getFamily(links[0]));
      }
    });
  }

  function onLogout() {
    user.set(undefined);
  }

  function onGetFamilys() {
    api.getFamilys().then(response => {
      familys = response;
    });
  }

  function onLinkFamily(family_) {
    api.linkFamily(family_.id).then(response => {
      family.set(family_);
    });
  }

  function onCreateFamily() {
    var familyId;
    api.createFamily(newFamily.name).then(response => {
      openCreateFamily = false;
      familyId = response.insertId;
      return api.addFamilyMember(familyId, $user.id, "parent", newFamily.mark);
    }).then(response => {
      onLinkFamily(familyId);
    });
  }

</script>

<main id="user-page">
  <!-- <RadioButton name="aa" value="a" checked={true} />
  <RadioButton name="aa" value="b" />
  <input type="radio" name="killOrder" value="1"/>
  <input type="radio" name="killOrder" value="0" checked/> -->
  {#if $user === undefined}
    用户名
    <TextField bind:value={loginUser.username}/>
    密码
    <TextField bind:value={loginUser.password} type="password"/>
    <div class="app-line">
      <Button filled on:click={onRegister}>注册</Button>
      <Button filled on:click={onLogin}>登录</Button>
    </div>
  {:else}
    <h1>{$user.name}</h1>
    <Button filled on:click={onLogout}>登出</Button>
    
    <Divider/>

    {#if familys.length > 0}
      <Table headers={[
        // {text: 'id', value: 'id'},
        {text: '', value: 'id'},
        {text: '名称', value: 'name'},
        {text: '角色', value: 'role'},
        {text: '标记', value: 'mark'},
      ]} items={familys}>
        <div slot="item" let:header={header} let:item={item}>
          {#if header.value === "id"}
            <RadioButton name="familys" value={item.id} checked={item.id==7} on:change={(event) => {
              console.log({event});
              familyLink = event.detail.value;
              onLinkFamily(item);
            }} />
          {:else}
            {item[header.value]}
          {/if}
        </div>
      </Table>
    {:else}
      <Button filled on:click={onGetFamilys}>获取所有家庭</Button>
    {/if}

    <div class="app-line">
      <Button filled on:click={() => openCreateFamily = true}>创建家庭</Button>
    </div>

    <Divider/>

    {#if $family !== undefined}
      <h1>{$family.name}</h1>
    {/if}

  {/if}

  <Modal bind:open={openCreateFamily}>
    <Dialog title="创建家庭">
      名称
      <TextField bind:value={newFamily.name}/>
      身份标记
      <TextField bind:value={newFamily.mark}/>
      <Button filled rectangle small on:click={onCreateFamily}>创建</Button>
    </Dialog>
  </Modal>
</main>

<style>
#user-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-line {
  display: flex;
}
</style>