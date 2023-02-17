<template>
<div class="app">

    <div class="header">
      <router-link to="/" class="home">
        <img src="https://cdn-icons-png.flaticon.com/512/4043/4043180.png">
        {{ user }}
      </router-link>
    </div>

    <div class="body">
      <router-view></router-view>
    </div>

</div>
</template>

<script>

export default {
  name: 'App',
}
</script>

<style lang="scss">
  body {
    margin:0;
  }
  .app {
    display:grid;
    grid-template-rows: 60px auto;
    grid-template-areas: 
    "header"
    "body";
  }
  .header {
    width:100%;
    height: 60px;
    position: fixed;
    grid-area:header;
    display: grid;
    grid-template-columns: 10% auto 40%;
  }
  .body {
    grid-area:body;
  }
  img {
    height:50px;
  }
  a {
    display: inline-block;
    width:10%;
  }
  .home {
    grid-column-start: 1;
    grid-column-end: 1;
    place-self: center;
  }

</style>