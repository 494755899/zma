<template>
  <div id="app">
    <img src="./assets/logo.png" @click="fire">
    <p @click="unbind">unbind</p>
    <router-link to="test"><button>切换路由</button></router-link>
    <router-view/>
  </div>
</template>

<script>
// import Zma from '../zma/zma.js'
import Zma from '../zma'
export default {
  name: 'App',
  created() {
    this.ema = Zma.getProxy()
    this.ema.on(['app', 'anotherapp'], () => {
      console.log('two event')
    })
    this.ema.once('say', (param, a) => {
      console.log(param, a)
    })
  },
  methods: {
    fire () {
      // this.ema.fire(['app', 'app2', 'app3'])
    },
    unbind () {
      // this.ema.unbind('app3')
    },
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
