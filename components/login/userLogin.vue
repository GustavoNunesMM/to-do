<template>
    <form class="login">

        <input v-model="user"  class="user"
        @keypress.enter="EnterPage()" placeholder="Usuario" >

        <input type="password" class="password" v-model="password" 
        @keypress.enter="EnterPage()" placeholder="Senha">

    </form>

    <div class="enter__buttons">
        <button @click.prevent="EnterPage()"> Entrar</button>
        <button @click="singIn()">Registre-se</button>
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
            warning: "oi",
        }
    },
    props: {
        isSingIn: Boolean
    },

    methods: {
        EnterPage() {
            axios.get(db)
            .then(({ data }) => {
                let filterData = data.filter(users => users.user === this.user)
                if (filterData[0].password === this.password) {
                this.entry(filterData[0].id)
                this.warning = ""
                return
                }
                this.warning = "Usuario/Senha incorreta"
        })
    },
    entry(id) {this.$router.push(`user/${id}`)},

    singIn() {let SingIn = this.isSingIn
        SingIn = true
        this.Handler(SingIn)
    },

},
    setup(props, { emit }) {
        const Handler = (SingIn) => {
        emit('update:isSingIn', SingIn)
    }
        return {Handler}
    }
}
</script>
<style lang="scss">

.login {
    grid-area: 2/2/2/2;
    width: 90%;

    display:flex;
    flex-direction: column;


    .user .password {
        place-self: center;
        width: 50%;
    }

  }  

</style>