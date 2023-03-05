<template>
  <!-- eslint-disable vue/no-deprecated-v-bind-sync -->
    <img class="background" src="../../public/background.svg">

    <div class="enter">

      <img class="enter__homeLogo" src="../../public/login.svg">
      <userLogin class="userLogin"
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
  padding: 10%;

  display:grid;
  grid-template-columns:10% 80% 10%;
  grid-template-rows: 30% 40% 10% 10%;
  grid-gap:10px;

  &__buttons {
    grid-area: 3/2/3/2;

    width:100%;
    margin-top: 10px;

    display:flex;
    flex-direction:row;

    align-content: center;
    justify-content: center;
  }

  &__homeLogo {
    grid-area: 1/2/1/2;
    width: 100%;
    height:100%;
  }

  &__register {
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
  margin:5px;
  width: 40%;
  height: 30px;
  border-radius: 10px;
  border: none;
  
}

 @media screen and (max-height: 800px) {
  .enter {
    &__register {
      grid-area: 1/2/2/2;
      width: 90%;
    }

    &__homeLogo {
      display:none
    }
  }
}

@media screen and (max-width: 768px) {
  .background {
    display: none;
  }
  .body {
    grid-template-columns: 10% 80% 10%;
    grid-template-rows: 10% 80% 5% 5%;
  }
  .enter {
    grid-area: 2/2/2/2;
    margin: 2%;
    padding: 2%;

    &__buttons {
      grid-area: 4/2/4/2;
      margin-bottom: 20px;
    }
  }
}

// @media screen and (min-width: 770px) and (max-width: )

 

  



// @media screen and (min-width: 900px) and (max-width: 1400px) {
//   asdasd
// }
</style>