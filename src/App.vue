<template>
  <div class="app">
    <div class="sidebar">
      <input class="newItem" v-model="input" autofocus @keypress.enter="CreateTask()" placeholder="Digite uma nova Tarefa"> 
      <button class="addNewItem" @click="CreateTask()">Incluir</button>

      <form v-for="(item,index) in itens" :key="index">
        <button class="item" @click.prevent="show(index)"> {{ item.nameTask }} </button> 
        <button class="deleteItem" @click.prevent="DeleteTask(index)">Deletar</button>
      </form>
    </div>
    <div class="VisibleItem" v-for="(item,index) in itens" :key="index" v-show="item.isVisible">
      <input v-model="inputTarefa" placeholder="Digite um novo item"> 
      <button @click="CreateSubTask(index)">Adicionar item</button>
      
        <div v-for="(text,id) in item.Text" :key="id"> 
          <div class="task">
            {{ text }} <button class="deleteSubTask" @click.prevent="deleteSubTask(index,id)">Delete</button>
          </div>
          
        </div> 
          
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
      Id: 0,
    }
  },
  mounted() {
    if(localStorage.itens) {
      this.itens = JSON.parse(localStorage.itens);
      this.id = this.itens.pop.id
    }
  },
  watch: {
    itens: {
      handler(newCard) {
        localStorage.itens = JSON.stringify(newCard)
      }, 
      deep: true
    }
  },
  methods: {
    CreateTask() {
      if (!this.input) return
      this.Id += 1
      this.itens.push(
      {nameTask: this.input,
      Text: [],
      id: this.Id,
      isVisible: false
      })
      this.input = ""
    },
    DeleteTask(id) {
      this.itens.splice(id, 1)
      if(this.Id >= 1) this.Id -= 1
    },
    show(index) {
      for(let item of this.itens) item.isVisible = false;
      this.itens[index].isVisible = true;
      console.log(this.itens)
    },
    CreateSubTask(index) {
      this.itens[index].Text.push(this.inputTarefa)
    },
    deleteSubTask(index,id) {
      this.itens[index].Text.splice(id, 1)
    }
  }
}
</script>

<style lang="scss">
html, body, #app, .app{
    height: 100%;
    width:100%;
    top: 0;
    position: fixed;
}
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display:grid;
  place-items:center;
  grid-template-columns: 20% 80%;
  grid-template-areas:
  "sidebar main";
  input {
      background-color:white;
      margin:20px;
      height: 30px;
      border: hidden;
      border-bottom:ridge;
      border-color: rgba(0, 0, 0, 0.5);
      outline:none;
    }
    button {
      height: 30px;
      background-color:white;
      border: none;
      height:30px;
    }
  .sidebar {
    grid-area: sidebar;
    padding-right:20px;
    border-right: solid;
    border-color: rgba(0, 0, 0, 0.5);
    height:100%;
    width:100%;
    
    .addNewItem {
      margin-left:-20px;
    }
    
    .item {
      background-color:rgba(128, 128, 128, 0.25);
      border-radius: 10px;
      width:70%;
      height: 30px;
      margin:10px;
       &:hover {
        background-color:rgba(128, 128, 128, 0.4)
       }
       &:onclick {
        background-color:rgba(128, 128, 128, 0.6)
       }
    }

    .deleteItem {
      background-color:rgba(128, 128, 128, 0.25);
      border-radius:10px;
      width:20%;

      border:outset;
      border-width: 1px;
      border-color:rgba(102, 102, 102, 0.5);
    }
  }
  .VisibleItem {
    grid-area: main;
    .task {
      width: 80%;
      margin: 20px;
    }
    .deleteSubTask {
      background-color:rgba(128, 128, 128, 0.25);
      border-radius:10px;
      width:20%;
    }
  }
}

</style>
