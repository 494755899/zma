<template>
  <div id="app">
    <img src="./assets/logo.png" @click="fire">
    <p @click="unbind">unbind</p>
    <router-link to="test"><button>切换路由</button></router-link>
    <router-view/>
  </div>
</template>

<script>
import Zma from './zma'
export default {
  name: 'App',
  created() {
    this.ema = Zma.getProxy('app')
    this.ema.on('ff', () => {
      console.log('app ff')
    })
    // this.ema.once('app2', () => {
    //   console.log('app2')
    // })
  },
  mounted() {
  },
  methods: {
    fire () {
      // this.ema.fire(['app', 'app2', 'app3'])
    },
    unbind () {
      // this.ema.unbind('app3')
    },
    fs() {
      console.log('app');
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
