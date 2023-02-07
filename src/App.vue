<template>
  <div class="app">
    <div class="sidebar">
      <input class="newItem" v-model="input" autofocus @keypress.enter="CreateTask()"> 
      <button @click="CreateTask()">Incluir</button>

      <form class="listItem" v-for="(item,index) in itens" :key="index">
        <button @click.prevent="show(index)"> {{ item.nameTask }} </button> 
        <button @click.prevent="DeleteTask(index)">Deleta tarefa</button>
      </form>
    </div>
    <div class="VisibleItem" v-for="(item,index) in itens" :key="index">
        <input v-model="itens[index].subItem.Titulo"> 
        <input v-model="inputTarefa"> <button @click="CreateSubTask(index)"></button>
        <h2>{{ item.subItem.Titulo }}</h2>
        <li v-for="(SubTarefa,id) in item.subItem.Texto" :key="id"> {{ SubTarefa }}</li>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      input: "",
      inputTarefa: "",
      itens: [],
      id: 0,
    }
  },
  mounted() {
    if(localStorage.itens) {
      this.itens = JSON.parse(localStorage.itens);
    }
    if(localStorage.Id) {
      this.id = JSON.parse(localStorage.id)
    }
  },
  watch: {
    itens: {
      handler(newCard) {
        localStorage.itens = JSON.stringify(newCard)
      }, 
      deep: true
    },
    id: {
      hadler(newId) {
        localStorage.id = JSON.stringify(newId)
      }
    }
  },
  methods: {
    CreateTask() {
      if (!this.input) return
      this.id += 1
      this.itens.push(
      {nameTask: this.input,
      subItem: {
        Titulo: "",
        Texto: []
      },
      id: this.id,
      isVisible: false,})
      this.input = ""
    },
    DeleteTask(id) {
      this.itens.splice(id, 1)
      if(this.id >= 1) this.id -= 1
    },
    show(index) {
      for(let item of this.itens) item.isVisible = false;
      this.itens[index].isVisible = true;
      console.log(this.itens)
    },
    CreateSubTask(index) {
      this.itens[index].subItem.Texto.push(this.inputTarefa)
    }
  }
}
</script>

<style lang="scss">
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display:grid;
  grid-template-columns: 30% 70%;
  grid-template-rows: 20% 80%;
  grid-template-areas:
  "sidebar main"
  "sidebar main";

  .sidebar {
    background-color:#2c3e50;
    grid-area: sidebar;
  }
  .VisibleItem {
    grid-area: main;
  }
}

</style>
