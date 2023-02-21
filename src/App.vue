<template>
<div class="app">
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
  a {
    display: inline-block;
    width:10%;
  }
 
</style>