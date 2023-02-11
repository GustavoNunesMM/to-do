<template>
  <div class="app">
    <TaskManager></TaskManager>
    
  </div>
</template>

<script>
import TaskManager from "./components/itemManager.vue"

export default {
  name: 'App',
  data() {
    return {
      ID:0,
    }
  },
  components: {
    TaskManager
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
  font-family: Helvetica, Arial, sans-serif;
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
    width:100%;
    .task {
      width: 80%;
      margin: 20px;
      justify-content: center;
    }
    .deleteSubTask, .complete, .modify {
      margin: 10px;
      background-color:rgba(128, 128, 128, 0.25);
      border-radius:10px;
      width:10%;
    }
    
  }
  .isCompleted {
    text-decoration: line-through;
  }
}

</style>
