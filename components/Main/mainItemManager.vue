<template>

    <div class="visibleItem" v-for="(item, index) in user.tasks" :key="index" 
    v-show="item.isVisible">
      <input v-model="input" @keypress.enter="CreateSubTask(index)" 
      placeholder="Digite um novo item"> 
      
      <button @click="CreateSubTask(index)">Adicionar item</button>

      <div v-for="(subItem,id) in item.subItem" :key="id"> 
        <div class="visibleItem__task">
          <a :class="{isCompleted: subItem.completed}"> {{ subItem.text }}</a> 

          <button class="visibleItem__task__modify" 
          @click="modifySubItem(index, id)">Modify</button>

          <button class="visibleItem__task__deleteSubTask" 
          @click="deleteSubTask(index,id)">Delete</button>

          <button class="visibleItem__task__complete" 
          @click="completeThisTask(index,id)">Complete</button>
        </div>
      </div> 
      
    </div>

</template>
<script>


export default {
    data() {
        return {
            input: "",
            texto: '',
        }
    },

    props: {
        user: {
            type: Object,
            required: true
        }
    },
    

    methods: {
        CreateSubTask(index) {
        const newUser = this.user
        if (!this.input) return
      
        if(newUser.tasks[index].isModifying) {
            newUser.tasks[index].Text.splice(this.subId, 1, { 
            text: this.input,
            completed: false 
            }); 
            newUser.tasks[index].isModifying = false;
            return
        }

        newUser.tasks[index].subItem.push({
            text: this.input,
            completed: false
        })

        this.input = ""
        },

        deleteSubTask(index,id) {
        const newUser = this.user
        newUser.tasks[index].subItem.splice(id, 1)
        },

        modifySubItem(index,id) { 
        const newUser = this.user
        this.input =  newUser.tasks[index].subItem[id].text;
        newUser.tasks[index].isModifying = true;
        },

        completeThisTask(index,id) {
        const newUser = this.user
        newUser.tasks[index].subItem[id].completed = !newUser.tasks[index].subItem[id].completed
        }
    },    
}
</script>

<style lang="scss">
.visibleItem {
    grid-area: main;
    width:100%;
    
    &__task {
      width: 80%;
      margin: 20px;
      justify-content: center;

        &__deleteSubTask, &__complete, &__modify {
            margin: 10px;
            background-color:rgba(136, 92, 255, 0.25);
            border-radius:10px;
            width:10%;
        }
    }
    
  }
  .isCompleted {
    text-decoration: line-through;
}
</style>