<template>
  <!-- eslint-disable vue/no-deprecated-v-bind-sync -->

  <HeaderComponent :user="user.user"/>

  <div class="TaskManager" v-if="!noHaveUser">
    <side-bar :user.sync="user" />

    <main-item-manager :user.sync="user" />
  </div>
  
  <div v-else>
    <h1>Sem usuario registrado.</h1>
  </div>
 
</template>

<script>
const axios = require("axios")

import HeaderComponent from '../../components/Main/headerComponent.vue'
import sideBar from '../../components/Main/sideBar.vue'
import mainItemManager from '../../components/Main/mainItemManager.vue'

export default {
  data() {
    return {
      user: {},
      userId: this.$route.params.id,
      noHaveUser: false
    }
  },
  components: {
    HeaderComponent,
    sideBar,
    mainItemManager
  },
  async created() {
    try {
      const { data } = await axios.get(`http://localhost:3000/user/${this.userId}`)
      this.user = data
      this.noHaveUser = false
    }
    catch {
      this.noHaveUser = true
    }
  },
  watch: {
    'user.tasks': {
      handler() {
        axios.put(`http://localhost:3000/user/${this.userId}`, this.user)
      }, 
      deep: true
    }
  }
}
</script>

<style lang="scss">
html, body, #app, .TaskManager{
    height: 100vh;
    width:100%;
}
.TaskManager {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  grid-area: 1/1/1/6;
  margin-top:100px;
  width:100%;
  display:grid;
  place-items:center;
  grid-template-columns: 20% 80%;
  grid-template-areas:
  "sidebar main";

}
</style>

