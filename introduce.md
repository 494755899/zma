大家好我们是运满满前端团队，这次给大家带来的分享是如何解决数据驱动带来强交互和深层次通信的痛点，在`vue react angular`三剑客的数据驱动模式的引领下，对数据展示的业务层结合spa应用带来了很大的方便

项目和需求是千变万化的，特别对于强交互和一些工具类的制作项目，每个组件通过事件管理器来管理自己的业务状态，只是通过事件发射器来来触发每个组件中监听的事件，也可以称之为简单的订阅发布模式，在`vue`中类似于中央事件，但是中央事件只能通过`$emit`与`$on`的模式进订阅和发布

#### 考虑一下什么情况下不适用于数据驱动模式，或者使用大量的数据驱动难以维护，组件多层级交互，跨层级交互带来的不便


![](https://user-gold-cdn.xitu.io/2018/5/15/1636181c73ca1281?w=742&h=414&f=png&s=33458)

每一个图形都是一个组件，有些工具类项目就像在一个画布上画画一样，交互行为很分散，数据跨越度太大，数据并没有太大的关联和展示性

### 通过数据驱动的模式如何去处理？


![](https://user-gold-cdn.xitu.io/2018/5/15/16361852f9d6b630?w=844&h=545&f=png&s=45114)

每个组件在交互的时候需要在顶层存储大量的数据，每种数据格式都不同，一旦数据量大了，就会显示的格外复杂，难以维护

正是因为`spa`应用把每个组件连接成一个大容器，在组件时进行销毁时，事件管理器同样也应该做到对每个组件不但进行订阅发布，也同时要做到进行订阅的销毁

在此我们对订阅发布模式进行强化，在事件总线中孵化每个组件里自己的订阅状态，同时在自身组件进行销毁时，总线上的订阅器同时能移除当前销毁的组件的订阅者


![](https://user-gold-cdn.xitu.io/2018/5/15/1636193748920079?w=1054&h=563&f=png&s=82502)

### 通过`zma`我们解决了什么问题？
1. 让数据更具有私有性，不让顶能数源存储大量的数据，再进行中转
2. 解决跨层级通信的麻烦程度
3. 通过简单的订阅去派发
4. 每个组件维护自己的数据，让数据变得更加可维护
5. 在组销毁时做到了总订阅层的同时销毁，性能提升
6. 相比vue中央事件，提供了大量的api，能应用对付多样的场景

[zma文档使用地址](https://github.com/494755899/zma)
感觉适用自己项目的给个star哦！感谢！

> 代码分析

`````
function zma () {
  const manager = {
    // 总订阅器订阅者存储点
    events: {},
    // 总订阅器一次订阅者的存放点
    onceEvents: [],
    // 总订阅器中需要冻结的订阅者名
    freezeEvents: [],
    // 订阅方法
    on(type, fn) {},
    // 发布方法
    fire(type, ...rest) {},
    // 解除订阅
    unbind(type, fn) {},
    // 一次订阅
    once(type, fn) {},
    // 冻结订阅者
    freezeEvent(type) {},
    // 解除冻结订阅
    clearFreezeEvent(type) {},
    // 清除所有订阅
    clear() {},
    // 生成当前组件的私有订阅器
    getProxy() {
      return new ManagerProxy(this)
    },
  }
  // 返回订阅器
  return manager
}
``````

> 总线的方法和大致轮廓实现

* 通过执行`zam函数`返回一个对象(总的订阅器)
* 属性 `events` 是一个总的订阅存储点，存放着所有的订阅者，包括只订阅一次的订阅者
* 属性 `onceEvents` 同样也是一个的订阅器存储点，与events不同的是，只存放只订阅一次的订阅者
* 属性 `freeeEvents` 是一个冻结名单，存放着被冻结的订阅者
* 方法 `on` 接收所有传入的订阅者，在传入总订阅器中，订阅者名单和所要做的事情进行保存
* 方法 `fire` 通过订阅者名单，发布这订阅者所交待的事件
* 方法 `once` 接收订阅一次的订阅者，向`onceEvents`向入订阅者名单，再把所有的订阅信息交给总订阅器进行记录保存
* 方法 `unbind` 根据传入的订阅者的信息，解除某些订阅者的订阅
* 方法 `freezeEvent` 根据传入订阅者的名单，暂时冻结订阅者的发布
* 方法 `clearFreezeEvent` 根据传入订阅者名单，解决冻结订阅者的发布
* 方法 `clear` 清除总订阅器上所的订阅者
* 方法 `getProxy`  返回一个新的实例对象，孵化出对应当前组件各自内部的订阅器，将manager总订阅器当参数传入，共享总订阅器的所有方法

整个方法体全部定义在总订阅器的对象上，通过`getProxy`孵化出每个组件私有的订阅器实列

>调用`getProxy`孵化出对应组个组件内部管理的订阅器

````js
function ManagerProxy(extendSolt) {
  this.extendSolt = extendSolt; // 上层的this指向manager对象
  this.msgs = [];
}

ManagerProxy.prototype.on = function(type, fn) {
  const result = this.extendSolt.on(type, fn);
  if (result) {
    this.msgs.push([type, fn]);
  }
};
ManagerProxy.prototype.fire = function(type) {
  this.extendSolt.fire(type);
};

ManagerProxy.prototype.once = function(type, fn) {
  const result = this.extendSolt.once(type, fn);
  if (result) {
    this.onceEvents.push([type, fn]);
  }
};

ManagerProxy.prototype.unbind = function(type) {
  this.extendSolt.unbind(type);
};
ManagerProxy.prototype.freezeEvent = function(type) {
  this.extendSolt.freezeEvent(type);
};
ManagerProxy.prototype.clearFreezeEvent = function(type) {
  this.extendSolt.clearFreezeEvent(type);
};
ManagerProxy.prototype.dispose = function() {
  const msgs = this.msgs;
  let i = msgs.length;
  while (i--) {
    this.extendSolt.unbind(msgs[i][0], msgs[i][1]);
  }
  this.msgs = null;
  this.extendSolt = null;
};

````

> 私有订阅器主流程：

通过`ManagerProxy`构造函数`new`出一个当前组件的订阅器实列，所有的方法全都挂载到其原型链上，通过挂载到原型链上，所有new出来当前组件订阅器的实列方法都是指向同一个引用，节省性能，减少内存的占用

`this.extendSolt` 通过new ManagerProxy时，向每个实列传入了总订阅器对象，以便用总订阅器和所有组件私有订阅器的功能复用度

`this.msgs` 订阅当前组件中所有的订阅者，包括一次订阅者订阅者

* `on` 调用总订阅器的方法，一旦订阅成功，则向当前组件订阅器里记录订阅
* `fire` 调用总订阅器的fire方法，两者共用
* `once` 调用总订阅器once方法，同时订阅成功后，则向当前组件订阅器记录订阅
* `unbind` `freezeEvent` `clearFreezeEvent` 调用总订阅器同样的方法, 两者共用
* `dispose` 循环当将要被销毁的组件中所有的订阅者，拿到订阅名和订阅事件，调用unbind方法，进行一个当前组件订阅的销毁

#### 大致结构体已经很明确，无论是从总订阅的大致结构，和私有订阅器的设计初衷，在总订阅器和私有订阅器实现同一功能api运用，私有订阅器有自我销毁机制

> 从表面看内在

### 1 .订阅方法
```
 manager = {
  events : {},
  on (type, fn) {
    if (isString(type) || isArray(type) && isFn(fn)) {
      if (isArray(type)) {
        // 如果传入订阅名是一个数组，则递归调用on方法，达到可以共同订阅
        for (let key of type) {
          this.on(key, fn);
        }
      } else {
        // 通过总订阅存储点查找，是否存在此订阅名的订阅空间
        let eventHandler = this.events[type];
        // 如果不存在，则把对应的订阅空间设置为空数组
        if (!eventHandler) {
          eventHandler = this.events[type] = [];
        }
        // 存在的情况下，获取订阅名对应的订阅空间长度
        let i = eventHandler.length;
        // 把订阅空间进行一个循环操作，
           如果方法是指向同一个引用，则只存一份，直接return false
        while (i--) {
          if (eventHandler[i] == fn) {
            return false;
          }
        }
        // 把订阅方法传入订阅名对应的订阅空间中，return ture
        eventHandler.push(fn);
        return true;
      }  
    }
    return false;
  }
}

```

用`events`对象来包裹每一个订阅者，面对同名订阅，所有的订阅事件全放在对应的数组中，以致于可以维护所有的同名订阅者


### 2. 一次订阅方法
```
  once(type, fn) {
    // 进行一个形参校验
    if (isString(type) && isFunc(fn)) {
      // once只是一次订阅，但是还是要通过on方法继续向订阅存储点存放
      const result = this.on(type, fn)
      // 一旦成功，向一次订阅存储点进行存储记录，返回true
      if (result) {
        this.onceEvents.push([type, fn])
        return true
      }
      // 否则返回false
      return false
    }
  }
```

从一次订阅方法中可以看出，虽然一次订阅但是还是必须把一次订阅存放在`events`对象中，但是同样也要向`onceEvents`中做好一次订阅的记录

### 3. 冻结订阅者

```
freezeEvent(type) {
// 对形参进行一个校验
  if (isString(type) || isArray(type)) {
    // 如果是多个事件名，调进行递归调用freezeEvent
    if (isArray(type)) {
      for (let key of type) {
        this.freezeEvent(key);
      }
    } else {
      // 向订阅冻结存储点传入订阅名
      this.freezeEvents.push(type);
    }
  }
},
```

冻结订阅者，从订阅名开始冻结，将所冻结的订阅名存放在`freezeEvents`中,一旦冻结，被 冻结的订阅者不会发布

#### 4. 解除冻结

```
clearFreezeEvent(type) {
  if (isString(type) || isArray(type)) {
    if (isArray(type)) {
      // 如果是数组，则进行递归解除冻结
      for (let key of type) {
        this.clearFreezeEvent(key);
      }
    } else {
      // 通过订阅名进行查找
      const index = this.freezeEvents.indexOf(type);
      // 如果查到则把数组中原本冻结名给去除，解除冻结
      if (index >= 0) {
        this.freezeEvents.splice(index, 1);
      }
    }
  }
},
```

在某些场景下通过冻结可以很好的维护订阅者，不要返复的订阅和解除订阅，无论是对性能还是从功能方面来说，都是优先性!

### 5. 发布订阅

```
fire(type, ...rest) {
      if (isString(type) || isArray(type)) {
        if (isArray(type)) {
          // 如果是数组，则进行递归发布
          for (let key of type) {
            this.fire(key, ...rest);
          }
        } else {
          // 通过发布名能过总订阅存储点拿到对应的发布空间
          let emitEvent = this.events[type];
          // 如果没有发布空间，或者某订阅名被冻结，直接退出 
          if (!emitEvent || this.freezeEvents.indexOf(type) >= 0) {
            return false;
          }
          // 否则循环对应的订阅发布空间，触发订阅者的订阅方法
          let i = 0;
          while (i < emitEvent.length) {
            emitEvent[i](...rest);
            i++;
          }
          // 同时通过订阅名比较onceEvents存储点进行一个比较
             在相当同的订阅中，比较events总的订阅点和onceEvents一次订阅点的
             订阅事件引用相同时，同时删除者的订阅，防止在下次发布的时候再次触发
          for (let m = 0; m < this.onceEvents.length; m++) {
            const onceEvents = this.onceEvents;
            const curOnceEvents = onceEvents[m];
            const curEventType = this.events[type];
            if (curOnceEvents[0] === type) {
              for (let j = 0; j < curEventType.length; j++) {
                if (curOnceEvents[1] === curEventType[j]) {
                  curEventType.splice(j, 1);
                  onceEvents.splice(m, 1);
                  break;
                }
              }
            }
          }
          // 比对过后，如果events某个订阅者没有任何订阅事件上的话，则把当前订阅者移除
          if (!this.events[type].length) {
            delete this.events[type];
          }
        }
      }
    },
```
在发布中，正是因为支持同名订阅，所以要做到循环发布，把每个订阅名下的订阅事件，进行一个循环发布，同时对`onceEvents`里的一次订阅点和总订阅点进行一个比较，如果存在的话，进行移除订阅者，因为支持同名订阅，可能有些同名订阅只订阅一次，可能有些同名订阅想订阅多些，这里进行了事件引用的比较，这样就这可以区分同名的订阅

### 6. 取消订阅

```
unbind(type, fn) {
  if (isString(type) || isFunc(fn)) {
    if (!fn) {
      delete this.events[type];
    } else {
      // 通过订阅名拿到对应的取消订阅空间
      const eventHandler = this.events[type];
      // 拿到订阅空间的长度
      let eventHandlerL = eventHandler.length;
      // 如果有订阅空间
      if (eventHandler && eventHandlerL) {
         // 有些情况下有两种可能，是私有订阅器需要进行组件级别的全部销毁，还有一种是需要针对订阅名进行销毁
        if (fn) {
           while (eventHandlerL--) {
              if (eventHandler[eventHandlerL] == fn) {
                eventHandler.splice(eventHandlerL, 1);
                break;
              }
            }
        } else {
            delete this.events[type]
        }
        // 比对过后，如果events某个订阅者没有任何订阅事件上的话，则把当前订阅者移除
        if (!eventHandlerL) {
          delete this.events[type];
        }
      }
    }
  }
},
```

取消订阅对于仅仅只有能过订阅名进行取消订阅的话，将会把所有订阅名下的订阅空间全都移除，同时也会导致如果是同名的订阅的话，无法针对同名订阅的某一个订阅移除，所以尽量用不同名之间的区分去区别，如果非要针对同名事件取消其中想要的订阅，在第二个参数，传入绑定时的引用，把传入的事件，额外提出来，在绑定和解绑的时候此时就是同一个引用，就可以针对性销毁

### 7.组件销毁

````
ManagerProxy.prototype.dispose = function() {
  const msgs = this.msgs;
  let i = msgs.length;
  while (i--) {
    this.extendSolt.unbind(msgs[i][0], msgs[i][1]);
  }
  this.msgs = null;
  this.extendSolt = null;
};
````

在每个组件私有的订阅器上都有`dispose`方法，通过拿到自己私有的订阅存储点`this.msgs`进行一个循环，通过`unbind`方法在总订阅器中进行一一比较的销毁,此时就有关联到`unbind`方法中有第二个`fn`传参时，在内部机制调用时，在总订阅的存储点中进行一个比对查找进行销毁当前执行销毁组件中的订阅者,注意在使用时，必须在组件销毁时调用`dispose`方法