<script>
	import { onMount, onDestroy } from 'svelte'
  import { replace } from "svelte-spa-router";
	import {
    Button,
    Table,
    TextField,
    Modal,
    Dialog,
    RadioButton,
    Divider,
    Dropdown,
    DropdownShell,
  } from 'attractions'
  import { ChevronDownIcon } from 'svelte-feather-icons'
	import { user, family, member } from '../store'
	import api from '../network/api'

  let loginUser = {
    username: "",
    password: ""
  };

  let familyLink = 7;
  let familys = [];
  let openCreateFamily = false;
  let newFamily = {
    name: "",
    mark: ""
  }

  let roles = [];
  let members = [];
  let openAddMember = false;
  let newMember = {
    userName: "",
    role: "",
    mark: ""
  }

  const familysubscribe = family.subscribe(value => {
    if (value !== undefined) {
      api.getFamilyMembers(value.id).then(response => {
        members = response;
      });
    }
  });

  onMount(() => {
    if($user !== undefined) {
      getFamilys();
    }
  });

  onDestroy(() => {
    familysubscribe();
  });

  function onRegister() {
    api.register(loginUser.username, loginUser.password).then(response => {
      if (response.userId > 0) {
        user.set({
          id: response.userId,
          name: loginUser.username
        });
        replace("/");
      }
    });
  }

  function login() {
    api.login(loginUser.username, loginUser.password).then(async response => {
      // user.set(response);
      replace("/");
    });
  }

  function logout() {
    user.set(undefined);
    family.set(undefined);
    member.set(undefined);
    window.localStorage.setItem("token", "");
    replace("/login");
  }

  function getFamilys() {
    api.getFamilys().then(response => {
      familys = response;
    });
  }

  function linkFamily(family_) {
    api.linkFamily(family_.id).then(response => {
      family.set(family_);
      api.getFamilyMember(family_.id).then(response2 => {
        member.set(response2);
      });
    });
  }

  function createFamily() {
    var familyId;
    api.createFamily(newFamily.name).then(response => {
      openCreateFamily = false;
      familyId = response.insertId;
      return api.addFamilyMember(familyId, $user.id, "parent", newFamily.mark);
    }).then(response => {
      linkFamily(familyId);
    });
  }

  function showAddMember() {
    api.getRoles().then(response => {
      roles = response;
      openAddMember = true;
    });
  }

  function addMember() {
    api.addFamilyMember($family.id, newMember.userName, newMember.role, newMember.mark).then(response => {
      console.log({response});
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
      <Button filled on:click={login}>登录</Button>
    </div>
  {:else}
    <h1>{$user.name}</h1>
    <Button filled on:click={logout}>登出</Button>
    
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
              linkFamily(item);
            }} />
          {:else}
            {item[header.value]}
          {/if}
        </div>
      </Table>
    {:else}
      <Button filled on:click={getFamilys}>获取所有家庭</Button>
    {/if}

    <div class="app-line">
      <Button filled on:click={() => openCreateFamily = true}>创建家庭</Button>
    </div>

    <Divider/>

    {#if $family !== undefined}
      <h1>{$family.name} ({$member.roleName})</h1>
      <Table headers={[
        {text: '名称', value: 'userName'},
        {text: '角色', value: 'role'},
        {text: '标记', value: 'mark'},
      ]} items={members} />
      <Button filled on:click={showAddMember}>添加成员</Button>
    {/if}

  {/if}

  <Modal bind:open={openCreateFamily}>
    <Dialog title="创建家庭">
      名称
      <TextField bind:value={newFamily.name}/>
      身份标记
      <TextField bind:value={newFamily.mark}/>
      <Button filled rectangle small on:click={createFamily}>创建</Button>
    </Dialog>
  </Modal>

  <Modal bind:open={openAddMember}>
    <Dialog title="添加成员">
      名称
      <TextField bind:value={newMember.userName}/>
      角色
      <DropdownShell let:toggle>
        <Button on:click={toggle}>
          {#if newMember.role.length <= 0}
            点击选择角色
          {:else}
            {newMember.role}
          {/if}
          <ChevronDownIcon size="24" class="ml dropdown-chevron" />
        </Button>
        <Dropdown>
          {#each roles as role}
            <Button filled rectangle small on:click={() => newMember.role = role.name}>{role.name}</Button>
          {/each}
        </Dropdown>
      </DropdownShell>
      身份标记
      <TextField bind:value={newMember.mark}/>
      <Button filled rectangle small on:click={addMember}>添加</Button>
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