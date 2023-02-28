<template>
    <div class="Header">
        <router-link to="/" class="home">
          <img src="https://cdn-icons-png.flaticon.com/512/4043/4043180.png">
        </router-link>
        <h2>{{ user }}</h2>
    </div>
</template>

<script>
export default {
  props: {
    user: String
  }  
}
</script>

<style lang="scss">
.Header {
    grid-column-start: 1;
    grid-column-end: 5;
    width:100%;
    height: 8%;
    position: fixed;
    display: grid;
    grid-template-columns: 10% auto 40%;
    background-color: rgba(0, 0, 255, 0.5);
    h2 {
      grid-column-start: 3;
      place-self: center right;
      margin-right: 30px;
    }
  }
  img {
    height:50px;
  } 
  .home {
    grid-column-start: 1;
    grid-column-end: 1;
    place-self: center;
  }

</style>