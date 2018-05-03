<template>
  <div class="hello">
    <h1 @click="unbind">unbind</h1>
    <h2 @click="myClick">测试触发事件</h2>
  </div>
</template>

<script>
import Zma from '../zma'
export default {
  name: 'test',
  created() {
    Zma.on('ff', () => {
      console.log('go')
    })
    Zma.on('mm', () => {
      console.log(go)
    })
    this.ema = Zma.getProxy('test')
    this.ema.on(['app','app2'], () => {
      console.log('hello app')
    })
    this.ema.on('ff', () => {
      console.log('hello app')
    })
    // console.log('hello created')
  },
  destroyed () {
    this.ema.dispose()
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    myClick() {
      // this.ema.fire('app')
    },
    unbind() {
      this.ema.fire(['app','gobal'],'ff',2,3,4,5)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
