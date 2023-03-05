<template>
    <form class="enter__register">

    <input type="text" v-model="registerUser" placeholder="Usuario">
    <input type="password" v-model="registerPassword" placeholder="Senha">
    <input type="password" v-model="registerConfirmPassword" placeholder="Confirme a senha">
    <input type="email" v-model="registerEmail" placeholder="E-mail">

    </form>
    <a>{{ warning }} </a>
    <div class="enter__buttons">
        <button @click.prevent="reg()">Registrar</button>
        <button @click.prevent="notSingIn()"> Voltar</button>
    </div>
</template>

<script>
const axios = require("axios")
const db = "http://localhost:3000/user"

export default {
    props: {
        isSingIn: Boolean,
    },
    data() {
        return {
            apiData: {},
            register: [],
            registerUser: "",
            registerPassword: "",
            registerConfirmPassword: "",
            registerEmail:"",
            warning:"",
        }
    },
    mounted() {
        axios.get(db)
        .then(data => this.apiData = data)
        .catch((e) => console.error(e))
    },
    methods: {
        notSingIn() {this.$emit('update:isSingIn', false)},

        reg() {
            try {
            if (this.registerPassword !== this.registerConfirmPassword) {
                this.warning =  "senhas não conferem"
                return
            }
            for (let id of this.apiData.data) {
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
            })
            .then(data => {this.apiData = data})
            .catch(err => console.log(err))
            this.notSingIn()
            } catch (e) {
                console.log(e)
            }
            
        },
    }
}
</script>
<style lang="scss">
    .enter_register {
        display: flex;
        flex-direction: column;
    }
    input {
            width: 100%;
        }
</style>