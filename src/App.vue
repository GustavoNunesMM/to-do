<template>

<div class="app">

  <div class="body">
    <router-view/>
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
  a {
    display: inline-block;
    width:10%;
  }
  input {
    background-color:white;
    margin: 10px;
    height: 30px;
    border: hidden;
    border-bottom: ridge;
    border-color: rgba(0, 0, 0, 0.5);
    outline:none;
  }
  button {
    height: 30px;
    background-color:rgb(255, 255, 255);
    border: none;
    height:30px;
  }
  .app {
  height:100vh;
  }
  .body {
  height: 100%;
  display:grid;
  grid-template-columns: 10% 50% 30% 10%;
  grid-template-rows: 10% auto 10%;
  }
 
</style>