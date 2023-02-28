<template>
    
    <div class="sidebar">
        <input class="sidebar__newItem" v-model="input" 
        autofocus @keypress.enter="CreateTask()" 
        placeholder="Digite uma nova Tarefa"> 

        <button class="sidebar__addNewItem" @click="CreateTask()">Incluir</button>
        <div v-for="(item, index) in user.tasks" :key="index">

            <button :class="{show:item.isVisible}" class="sidebar__addNewItem__item" @click="show(index)"> 
                {{ item.nameTask }} 
            </button> 
            <button class="sidebar__addNewItem__deleteItem" @click="DeleteTask(index)">
                Deletar
            </button>
        </div>
    </div>

</template>

<script>
export default {
    data() {
      return {
        input: ""
      }  
    },

    props: {
        user: {
            type: Object,
            required: true
        }
    },

    methods: {
        CreateTask() {
            if (!this.input) return

            const newUser = { ...this.user }
            this.id += 1
            newUser.tasks.push({
                id: this.id,
                nameTask: this.input,
                subItem: [],
                isVisible: false,
                isModifying: false
            })
            
            this.input = ""
            this.$emit('update:user', newUser)
        },

        DeleteTask(id) {
            const newUser = { ...this.user }
            newUser.tasks.splice(id, 1)
            if(this.id >= 1) this.id -= 1

            this.$emit('update:user', newUser)
        },
        
        show(index) {
            const newTasksUser = this.user.tasks.map((task, taskIndex) => taskIndex === index ? task.isVisible = true : task.isVisible = false)
            this.$emit('update:user', newTasksUser)
        }
    }
}

</script>

<style lang="scss" scoped>
.sidebar {
    grid-area: sidebar;
    padding-right:20px;
    border-right: solid;
    border-color: rgba(0, 0, 0, 0.5);
    height:100%;
    width:100%;
    
    &__addNewItem {
    margin-left:-20px;
        
        &__item {
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
        
        &__deleteItem {
            background-color:rgba(136, 92, 255, 0.25);
            border-radius:10px;
            width:20%;

            border:outset;
            border-width: 1px;
            border-color:rgba(136, 92, 255, 0.5);
        }
    }
    .show {
        background-color:rgba(136, 92, 255, 0.5)
    }
  

  
  }
</style>