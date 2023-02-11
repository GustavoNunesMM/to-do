<template>
  <div class="sidebar">
    <input class="newItem" v-model="input" autofocus @keypress.enter="CreateTask()" placeholder="Digite uma nova Tarefa"> 
    <button class="addNewItem" @click="CreateTask()">Incluir</button>

    <form v-for="(item,index) in itens" :key="index">
      <button class="item" @click.prevent="show(index)"> {{ item.nameTask }} </button> 
      <button class="deleteItem" @click.prevent="DeleteTask(index)">Deletar</button>
    </form>
  </div>

  <div class="VisibleItem" v-for="(item,index) in itens" :key="index" v-show="item.isVisible">
    <input v-model="inputTarefa" @keypress.enter="CreateSubTask(index)" placeholder="Digite um novo item"> 
    <button @click="CreateSubTask(index)">Adicionar item</button>

    <div v-for="(Text,id) in item.Text" :key="id"> 
      <div class="task">
        <a :class="{isCompleted: Text.completed}"> {{ Text.text }}</a> <button class="modify" @click.prevent="modifySubItem(index, id)">Modify</button>
        <button class="deleteSubTask" @click.prevent="deleteSubTask(index,id)">Delete</button>
        <button class="complete" @click.prevent="completeThisTask(index,id)">Complete</button>
      </div>
    </div> 
  </div>
</template>

<script>

export default {
  data() {
    return {
        input: "",
        inputTarefa: "",
        itens: [],
        Id: 0,
        subId:0,
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
      deep: true,
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
      isVisible: false,
      isModifying: false
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
      if (!this.inputTarefa) return
      console.log(this.itens[index].isModifying)
      if(this.itens[index].isModifying) {
        console.log(this.itens[index])
        this.itens[index].Text.splice(this.subId, 1, {text: this.inputTarefa,
        completed: false} );
        this.itens[index].isModifying = false;
        return
      }
      this.itens[index].Text.push({text: this.inputTarefa,
      completed: false})
      this.inputTarefa = ""
    },
    deleteSubTask(index,id) {
      this.itens[index].Text.splice(id, 1)
    },
    modifySubItem(index,id) { 
      this.inputTarefa =  this.itens[index].Text[id].text;
      this.itens[index].isModifying = true;
      this.subId = id;
    },
    completeThisTask(index,id) {
      this.itens[index].Text[id].completed = !this.itens[index].Text[id].completed
      
    }
  }
}
</script>
