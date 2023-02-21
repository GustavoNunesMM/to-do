<template>
  <HeaderComponent/>
  <div class="TaskManager" v-if="!noHaveUser">
    <div class="sidebar">
      <input class="newItem" v-model="input" autofocus @keypress.enter="CreateTask()" placeholder="Digite uma nova Tarefa"> 
      <button class="addNewItem" @click="CreateTask()">Incluir</button>
        <div v-for="(item,index) in user.tasks" :key="index">
            <button class="item"  @click="show(index)"> {{ item.nameTask }} </button> 
            <button class="deleteItem"   @click="DeleteTask(index)">Deletar</button>
        </div>
    </div>

    <div class="VisibleItem" v-for="(item, index) in user.tasks" :key="index" v-show="item.isVisible">
      <input v-model="inputTarefa" @keypress.enter="CreateSubTask(index)" placeholder="Digite um novo item"> 
      <button @click="CreateSubTask(index)">Adicionar item</button>

      <div v-for="(subItem,id) in item.subItem" :key="id"> 
        <div class="task">
          <a :class="{isCompleted: subItem.completed}"> {{ subItem.text }}</a> 
          <button class="modify" @click="modifySubItem(index, id)">Modify</button>
          <button class="deleteSubTask" @click="deleteSubTask(index,id)">Delete</button>
          <button class="complete" @click="completeThisTask(index,id)">Complete</button>
        </div>
      </div> 
    </div>
  </div>

  <div v-else>
    <h1>Não foi possível obter as tarefas do usuário</h1>

  </div>
  
</template>

<script>
const axios = require("axios")
import HeaderComponent from "./HeaderComponent.vue"

export default {
  data() {
    return {
      input: "",
      inputTarefa: "",
      user: {},
      Id: 0,
      subId:0,
      userId: this.$route.params.id,
      noHaveUser: false
    }
  },
  components: {
    HeaderComponent
  },
  async created() {
    try {
      const { data } = await axios.get(`http://localhost:3000/user/${this.userId}`)
      this.user = data
    } catch(e) {
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
  },
  methods: {
    CreateTask() {
      if (!this.input) return

      this.Id += 1
      this.user.tasks.push({
        id: this.Id,
        nameTask: this.input,
        subItem: [],
        isVisible: false,
        isModifying: false
      })

      this.input = ""
    },
    DeleteTask(id) {
      this.user.tasks.splice(id, 1)
      if(this.Id >= 1) this.Id -= 1
    },
    show(index) {
      for(let item of this.user.tasks) item.isVisible = false;
      this.user.tasks[index].isVisible = true;
    },
    CreateSubTask(index) {
      if (!this.inputTarefa) return
      
      if(this.user.tasks[index].isModifying) {
        this.user.tasks[index].Text.splice(this.subId, 1, { 
          text: this.inputTarefa,
          completed: false 
        }); 
        this.user.tasks[index].isModifying = false;
        return
      }

      this.user.tasks[index].subItem.push({
        text: this.inputTarefa,
        completed: false
      })

      this.inputTarefa = ""
    },
    deleteSubTask(index,id) {
      this.user.tasks[index].subItem.splice(id, 1)
    },
    modifySubItem(index,id) { 
      this.inputTarefa =  this.user.tasks[index].subItem[id].text;
      this.user.tasks[index].isModifying = true;
      this.subId = id;
    },
    completeThisTask(index,id) {
      this.user.tasks[index].subItem[id].completed = !this.user.tasks[index].subItem[id].completed
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

  input {
    background-color:white;
    margin: 10px;
    height: 30px;
    border: hidden;
    border-bottom: ridge;
    border-color: rgba(0, 0, 0, 0.5);
    outline:none;
  }
  button {
    height: 30px;
    background-color:rgb(255, 255, 255);
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
    background-color:rgba(136, 92, 255, 0.25);
    border-radius: 10px;
    width:70%;
    height: 30px;
    margin:10px;
      &:hover {
        background-color:rgba(136, 92, 255, 0.4)
      }
      &:onclick {
        background-color:rgba(136, 92, 255, 0.6)
      }
  }

  .deleteItem {
    background-color:rgba(136, 92, 255, 0.25);
    border-radius:10px;
    width:20%;

    border:outset;
    border-width: 1px;
    border-color:rgba(136, 92, 255, 0.5);
  }
  }
  
  .VisibleItem {
    grid-area: main;
    width:100%;
    
    .task {
      width: 80%;
      margin: 20px;
      justify-content: center;
    }
    .deleteSubTask, .complete, .modify {
      margin: 10px;
      background-color:rgba(136, 92, 255, 0.25);
      border-radius:10px;
      width:10%;
    }
    
  }
  .isCompleted {
    text-decoration: line-through;
  }
}

</style>

