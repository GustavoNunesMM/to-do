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
      
        <div v-for="(text,id) in item.Text" :key="id"> 
          <div class="task">
            {{ text }} <button class="deleteSubTask" @click.prevent="deleteSubTask(index,id)">Delete</button>
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
      this.inputTarefa = ""
    },
    deleteSubTask(index,id) {
      this.itens[index].Text.splice(id, 1)
    }
  }
}
</script>
