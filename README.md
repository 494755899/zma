## Ema是什么？

通常在spa应用中数据驱动是主流，但是往往在有些应用场面，在做一些工具型的应用，事件驱动和管理就能解决数据驱动往往需要通过复杂的数据管理方式去应用。Ema则是vue中央事件的增强，Ema是一个大事件管理场，在每个页面或每个组件孵化出每个小的ema，无论是每个小ema还是最外层的大Ema都能通知到每一个事件

> 使用方式

import EMA from 'Ema'

>如何在每个页面代理自己的小ema

### 比如在App.vue文件中

```
  created () {
      //或者当前页面管理的小ema, 所有的绑定的事件全都通过代理的ema管理
      this.ema = EMA.getProxy() 
  }
```

> 绑定事件
前面已经做好了生成ema的管理器  

```
  mounted () {
      this.ema.on('say', (param) => {
          console.log(param)
          console.log('hello world')
      })
  }
```
aa