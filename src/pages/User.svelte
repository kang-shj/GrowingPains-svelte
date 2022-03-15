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
    Loading,
  } from 'attractions'
  import { ChevronDownIcon } from 'svelte-feather-icons'
	import { user, family, member } from '../store'
	import api from '../network/api'

  let loginUser = {
    username: "",
    password: ""
  };

  let linkFamilyId = 0;
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

  let registerUser;
  let waitRegister = false;
  function register() {
    waitRegister = true;
    api.register(loginUser.username, loginUser.password).then(async response => {
      registerUser = response;
      if ($user === undefined) {
        openCreateFamily = true;
        await new Promise((resolve) => {
          var timer = setInterval(() => {
            if (!openCreateFamily) {
              clearInterval(timer);
              resolve();
            }
          }, 500);
        });
      }
      registerUser = undefined;
      // user.set(response);
      replace("/");
      waitRegister = false;
    });
  }

  let waitLogin = false;
  function login() {
    waitLogin = true;
    api.login(loginUser.username, loginUser.password).then(async response => {
      // user.set(response);
      replace("/");
      waitLogin = false;
    });
  }

  function logout() {
    user.set(undefined);
    family.set(undefined);
    member.set(undefined);
    window.localStorage.setItem("token", "");
    api.setToken("");
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
      linkFamilyId = family_.id;
      api.getFamilyMember(family_.id).then(response2 => {
        member.set(response2);
      });
    });
  }

  let waitCreateFamily = false;
  function createFamily() {
    waitCreateFamily = true;
    api.createFamily(newFamily.name).then(response => {
      return api.getFamily(response.insertId);
    }).then(response2 => {
      var userId = $user !== undefined ? $user.id : registerUser.id;
      api.addFamilyMember(response2.id, userId, "parent", newFamily.mark).then(response3 => {
        if ($user !== undefined) {
          familys.push(response3);
        }
        linkFamily(response2);
        openCreateFamily = false;
        waitCreateFamily = false;
      });
    });
  }

  function showAddMember() {
    api.getRoles().then(response => {
      roles = response;
      openAddMember = true;
    });
  }

  let waitAddMember = false;
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
    <div></div>
    用户名
    <TextField bind:value={loginUser.username}/>
    密码
    <TextField bind:value={loginUser.password} type="password"/>
    <div class="app-line">
      <Button filled disabled={waitLogin || waitRegister} on:click={login}>登录</Button>
      <div style="margin: 0 16px">或</div>
      <Button filled disabled={waitLogin || waitRegister} on:click={register}>注册</Button>
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
            <RadioButton name="familys" value={item.id} checked={item.id===linkFamilyId} on:change={(event) => {
              console.log({event});
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
      <Button filled rectangle small disabled={waitAddMember} on:click={addMember}>添加</Button>
    </Dialog>
  </Modal>

  <Modal open={(waitRegister || waitLogin)} noClickaway={true}>
    <Loading />
  </Modal>

  <Modal bind:open={openCreateFamily} noClickaway={$user === undefined}>
    <Dialog title="创建家庭">
      名称
      <TextField bind:value={newFamily.name}/>
      身份标记
      <TextField bind:value={newFamily.mark}/>
      <div>
        {#if $user === undefined}
        <Button filled rectangle small disabled={waitCreateFamily} on:click={() => openCreateFamily = false}>跳过</Button>
        {/if}
        <Button filled rectangle small disabled={waitCreateFamily} on:click={createFamily}>创建</Button>
      </div>
    </Dialog>
  </Modal>

  
  <Modal open={waitCreateFamily} noClickaway={true}>
    <Loading />
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
  align-items: center;
}
</style>