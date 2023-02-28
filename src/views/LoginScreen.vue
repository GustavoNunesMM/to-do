<template>
  <!-- eslint-disable vue/no-deprecated-v-bind-sync -->
    <img class="background" src="../../public/background.svg">

    <div class="enter">

      <img class="enter__homeLogo" src="../../public/login.svg">
      <userLogin 
        :isSingIn.sync="isSingIn"
        v-if="!isSingIn"
        @update:isSingIn="isSingIn = $event"
      />     

      <userRegister
        :isSingIn.sync="isSingIn"
        v-if="isSingIn"
        @update:isSingIn="isSingIn = $event"
      />
      </div>
</template>

<script>

import userLogin from '../../components/login/userLogin.vue'
import userRegister from '../../components/login/userRegister.vue'

export default {
  data() {
    return {
      isSingIn: false,
      warning: "",
      userId: ""
    }
  },
  components: {
    userLogin,
    userRegister
  },
}

</script>
<style lang="scss">

.background {
  grid-area: 2/2/2/2;
  width: 100%;
  height: 100%;
}
.enter {
  grid-area: 2/3/2/3;
  margin-top:10%;
  margin-bottom:10%;
  background-color:rgba(0, 0, 255, 0.493);
  border-radius:10px;

  display:grid;
  grid-template-columns:10% 80% 10%;
  grid-template-rows: 30% 40% 10% 10%;
  grid-gap:10px;

  &__buttons {
    grid-area: 4/2/4/2;
    place-self:center;
  }

  &__homeLogo {
    grid-area: 1/2/1/2;
    width: 100%;
    height:100%;
  }

  &__register {
    margin-left:25%;
    grid-area: 2/2/4/2;
  }

a {
  grid-area: 3/2/3/2;
  justify-self: center;
  width:100%;
  text-align: center;
}

input {
  height: 30px;
  border-radius: 10px;
}

}
button {
  margin-left:10px;
  width: 100px;
  height: 30px;
  border-radius: 10px;
  border: none;
}


 

  


// @media screen and (min-width: 300px) and (max-width: 800px) {
//   img {
//     display: none;
//   }

//   .wrapper {
//     grid-template-columns: 100vw;
//   }
// }

// @media screen and (min-width: 900px) and (max-width: 1400px) {
//   asdasd
// }
</style>