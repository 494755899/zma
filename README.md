## zma是什么？

通常在spa应用中数据驱动是主流，但是往往在有些应用场面，在做一些工具型的应用，事件驱动和管理就能解决数据驱动往往需要通过复杂的数据管理方式整理逻辑显的有点乏力。zma类似于vue的中央事件，zma是一个总的事件管理厂，在每个页面或每个组件孵化出每个小的管事件管理厂，无论是每个小事件管理还是最外层的大事件总线都能通知到每一个订阅的事件

无论在vue， react, angular中都可以用此方法，去处理一些通过数据驱动过于复杂的应用，有时往往在进行老项目的时候，再减小维护成本的情况下，可以用Zma去代替vux等一系列的数据模式，对于后者维护来说，也是很明了，通过基于spa应用的事件管理器，只需要自己维护好自己组件的数据，在一些第三方大应用的组件层，无法用共享数据层去管理，则可以用zma的事件通信代替成为一个小共享数据层，称为顶层事件通信层

> 使用方式

`npm install zma`



>如何在每个页面中通过总线孵化出自己的内部的的事件管理厂

### App.vue文件中

```
  import Zma from 'zma'
  created () {
      通过getProxy生成一个新的事件小管理器，管理当前组件内部的事件
      this.zma = Zma.getProxy() 
  }
```

> 绑定事件
前面已经做好了生成当前组件的的事件管理器  

```
  mounted () {
      // 回调函数中可以接收任意参数
      this.zma.on('say', (param) => {
          console.log(param)
          console.log('hello world')
      })
  }
```
在任何组件中，或者同一个组件中都可以绑定同名事件
```
  mounted () {
      this.zma.on('say',() => {
          console.log('first say')
      })
      this.zma.on('say',() => {
          console.log('second say')
      })
  }
```
同样，也可以像vue中$on一样，通过数组绑定两个事件名
````
  mounted () {
      this.zma.on(['say','anotherSay'], () => {
          conosle.log('two event')
      })
  }
````
### 无论任何组件中，都可以绑定任何同名事件，当组件销毁时调用dispose方法时，只会销毁当前组件中的事件名，与其同名的其它组件中的事件不会销毁，除非通过事件名调用unbind方法手动销毁

> 手动销毁事件

在组件中可以调用unbind方法手动销毁监听的事件

```
  this.zma.unbind('say')
```
一旦调用unbind，所有组件的内部的say方法都会被销毁，必要的情况下可以通过事件名区分开来

> # 提升性能，如何销毁绑定事件

通过事件的管理全局的zma则是一个总线，管理着所有页面绑定的事件，在每个页面或者组件中都有自己的一个事件管理部门，当页面销毁时，为了提升性能优化，则要在组件销毁的时候手动销毁当前组件自己的绑定事件
```
  destoryed() {
     this.zma.dispose()
  }
```
## 在destoryed的时候请及时销毁当前组件的绑定,如果不销毁当页面进入再次绑定时会生成新的事件，会多次触发，所以在组件销毁时必须进行销毁


> 一次绑定


```
  mounted() {
      this.zma.once('once', () => {
          console.log('once')
      })
  }
```



一次绑定在触发之后，内部机制会自动销毁对应的绑定事件的执行函数，不会影响到其余的同名事件 on和once方法都能绑定想同的事件名


> 触发事件

### 无论在那个.vue文件中

通过调用fire方法，执行say事件，所有绑定的say事件都会执行，第二个参数之后传的都是向绑定事件传入的参数
```
  methods : {
      click () {
          this.zma.fire('say', 'param hello world')
      }
  }
```
同样也可以用数组的方式调用多个事件
```
  methods: {
      click () {
          this.zma.fire(['say','once'], 'param hello world')
      }
  }
```


> 销毁指定事件

```
  method () {
      this.zma.unbind('say')
  }
```
指定解绑事件，通过事件名则会销毁所有组件内的对应的绑定事件，必要的时候请用事件名区分开来


> 冻结事件

通过freezeEvent事件把指定的事件进行冻结
&& 支持数组参数

```
  this.zma.freezeEvent('say')
  &&
  this.zma.freezeEvent(['say','sayno'])
```

一旦冻结，调用fire方法则不会进行触发

> 解除冻结事件

通过clearFreezeEvent事件把指定的事件进行解除冻结
&& 支持数组参数
````
  this.zma.clearFreezeEvent('say')
  this.zma.clearFreezeEvent(['say', 'sayno'])
````
> 销毁所有监听事件

通地clear方法进行销毁所有监听事件
```
  this.zma.clear()
```

同时，在Zma的总线中，同样有着以上所有的方法，不包括（dispose），不适用于组件内，适用于其余的js文件中

example:

common.js
```
 import Zma from 'zma'
 Zma.on('say', () => {
     console.log('say')
 })
 Zma.fire('say')
 Zma.once('say',() => {
     console.log('say once')
 })
 ........
 ........
 其余的与组件中的小的管理事件器中的方法一样
```






