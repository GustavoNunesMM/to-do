<template>
  <img class="background" src="../../public/background.svg">
  <div class="enter">    
    <img class="homeLogo" src="../../public/login.svg">
    <form class="login" v-if="!isSingIn">

    <input id="usuario" v-model="user" @keypress.enter="EnterPage()" placeholder="usuario" >
    <input type="password" id="senha" v-model="password" @keypress.enter="EnterPage()" placeholder="senha">
    
    </form>
    <form class="register" v-if="isSingIn">
      
      <input type="text" class="user_R" v-model="registerUser" placeholder="Usuario">
      <input type="password" class="password_R" v-model="registerPassword" placeholder="Senha">
      <input type="password" class="password_R_confirm" v-model="registerConfirmPassword" placeholder="Confirme a senha">
      <input type="email" class="email" v-model="registerEmail" placeholder="E-mail">
      
    </form>
    <a>{{ warning }} </a>
    <div class="buttons">
      <button @click.prevent="EnterPage()" v-if="!isSingIn"> Entrar</button>
      <button @click="singIn()" v-if="!isSingIn">Registre-se</button>
  
      <button @click.prevent="reg()" v-if="isSingIn">Registrar</button>
      <button @click.prevent="notSingIn()" v-if="isSingIn"> Voltar</button>
    </div>

  </div>
</template>

<script>
const axios = require("axios")
const db = "http://localhost:3000/user"

export default {
  data() {
    return {
      user: "",
      password: "",
      ApiData: "",

      register: [],
      registerUser: "",
      registerPassword: "",
      registerConfirmPassword: "",
      registerEmail:"",

      isSingIn: false,
      warning: "",
      userId: ""
    }
  },
  mounted() {
    axios.get(db)
      .then(data => this.ApiData = data)
  },
  
  methods: {
    singIn() {
      return this.isSingIn = true;
    },

    notSingIn(){
      return this.isSingIn = false;
    },

    reg() {

      if (this.registerPassword !== this.registerConfirmPassword) {
        this.warning =  "senhas não conferem"
        return
      }
      for (let id of this.ApiData.data) {
        if (id.user === this.registerUser) {
          this.warning = "usuario ja utilizado"
          return
        }
        if (id.email === this.registerEmail) {
          this.warning = "e-mail ja utilizado"
          return
        }
      }
      axios.post(db,{
        user: this.registerUser,
        password: this.registerPassword,
        email: this.registerEmail,
        tasks: [],
      })
      .then(() => {
        console.log("usuario cadastrado")
        this.warning = "";
        axios.get(db)
        .then(data => this.ApiData = data)
      })
      .catch(err => console.log(err))
      this.isSingIn = true;
    },

    EnterPage() {
      axios.get(db)
        .then(({data}) => {
            let filterData = data.filter(users => users.user === this.user)
            if (filterData[0].password === this.password) {
              this.entry(filterData[0].id)
              return
            }
        })
    },
    entry(id) {
      this.$router.push(`user/${id}`)
    }

  }
}

</script>
<style lang="scss" scopped>
.app {
  height:100vh;
  
  .body {
    height: 100%;
    display:grid;
    grid-template-columns: 5% 50% 10% 25% 10%;
    grid-template-rows: 10% auto 15%;    
  }
  .background {
    grid-area: 2/2/2/2;
    width: 100%;
    height: 100%;
  }
  .enter {
    grid-area: 2/4/2/4;
    margin-top:15%;
    margin-bottom:15%;
    background-color:rgba(0, 0, 255, 0.493);
    border-radius:10px;

    display:grid;
    grid-template-columns:10% 80% 10%;
    grid-template-rows: 30% 40% 10% 10%;
    
    .login {
      margin-left:25%;
      grid-area: 2/2/2/2;
    }
    .register {
      margin-left:25%;
      grid-area: 2/2/4/2;
    }
    .buttons {
        grid-area: 4/2/4/2;
        place-self:center;
    }
    .homeLogo {
      grid-area: 1/2/1/2;
      width: 100%;
      height:100%;
    }
    a {
      grid-area: 3/2/3/2;
      margin-top:10%;
      justify-self: center;
      width:100%;
      text-align: center;
    }
    input {
    height: 30px;
    border-radius: 10px;
    margin-top: 20px;
    }

  }
  
  button {
    margin-left:10px;
    width: 100px;
    height: 30px;
    border-radius: 10px;
    border: none;
  }
}
</style>