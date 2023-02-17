<template>
  <div>    
    <form class="login">

    <label for="usuario">Usuario</label>
    <input id="usuario" v-model="user" > 

    <label for="senha">Senha</label>
    <input type="password" id="senha" v-model="password" >

    <button @click.prevent="EnterPage()"> Entrar</button>
    
    <!-- <router-link to="/Task" class="task"><button>Entrar</button></router-link> -->

    </form>
    <form class="register">
      
      <input type="text" class="user_R" v-model="register.user" placeholder="Usuario">
      <input type="password" class="password_R" v-model="register.password" placeholder="Senha">
      <input type="password" class="password_R_confirm" v-model="register.passwordConfirm" placeholder="Confirme a senha">
      <input type="email" class="email" v-model="register.email" placeholder="E-mail">
      <button @click.prevent="reg()">Registro</button>


    </form>
  </div>
</template>

<script>

const axios = require("axios")
const db = "http://localhost:3000/user"

export default {
  data() {
    return {
      user: "",
      password:"",
      ApiData: "",
      register: { user: "",
                  password: "",
                  passwordConfirm: "",
                  email: ""},
    }
  },
  mounted() {
    axios.get(db)
      .then(data => this.ApiData = data)
  },
  methods: {
    reg() {
      if (this.register.password !== this.register.passwordConfirm) return
      for (let id of this.ApiData.data) {
        if (id.user === this.register.user) return
        if (id.password === this.register.password) return
        if (id.email === this.register.email) return
      }
      axios.post(db,{
        user: this.register.user,
        password: this.register.password,
        email: this.register.email,
      })
      .catch(err => console.log(err))
    },
    EnterPage() {
      axios.get(db)
        .then(({data}) => {
            let filterData = data.filter(users => users.user === this.user)
            if (filterData[0].password === this.password) {
              this.entry()
            }
        })
    },
    entry() {
      this.$router.push("/Task")
      
    }

  }
}

</script>

<style lang="scss">

</style>