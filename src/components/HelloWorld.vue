<template>
  <div class="hello">
    <h1>HelloWorld</h1>
    <h2 @click="myClick">HelloWorld freeze事件</h2>
    <h2 @click="removeClick">HelloWorld removefreeze事件</h2>
  </div>
</template>

<script>
// import Zma from '../../zma/zma.js'
import Zma from '../../zma'
export default {
  name: 'HelloWorld',
  created() {
     this.ema = Zma.getProxy()
  },
  destroyed() {
     this.ema.dispose()
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    myClick() {
       this.ema.freezeEvent('app')

    },
    removeClick() {
       this.ema.clearFreezeEvent('app')
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

