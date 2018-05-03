function isString (type) {
  return typeof type === 'string'
}
function isFunc (fn) {
  return typeof fn === 'function'
}

function isArray (array) {
  return Object.prototype.toString.call(array) == '[object Array]'
}

function Zma () {
  const manager = {
    scopes : [],
    events: {},
    freezeEvents: [],
    onceEvents: [],
    on (type, fn, scope) {
      if (isString(type) && isFunc(fn)) {
        if (isArray(type)) {
            this.on(type, fn, scope)
        } else {
            scope = scope ? scope : 'gobal'
            let emitScope = this.events[scope]
            if (!emitScope) {
                emitScope = this.events[scope] = {}
            }
            let emitType = emitScope[type] = fn
            console.log(this.events)
        }
      }
    },
    fire() {
        const [scope, ...any] = [...arguments]
        let fireScope, fireType, otherArguments
        if (isArray(scope)) {
           fireScope = scope
           const [type, ...other] = any
           fireType = type
           otherArguments = other
        } else {
            fireType = scope
            otherArguments = any
        }
        Object.keys(this.events).forEach(item => {
            const scope = this.events[item]
            if (fireScope && fireScope.indexOf(item) < 0) {
                return
            }
            Object.keys(scope).forEach(type => {
                if (type === fireType) {
                    scope[type](...otherArguments)
                }
            })
        })
        // console.log(fireScope, fireType, otherArguments)
    },
    dispose(scope) {
      const index = this.scopes.indexOf(scope)
      this.scopes.splice(index, 1)
      delete this.events[scope]
      console.log(this.events)
    },
    // fire (type, ...rest) {
    //   if (isString(type) || isArray(type)) {
    //     if (isArray(type)) {
    //       for (let key of type) {
    //         this.fire(key, ...rest)
    //       }
    //     } else {
    //       let emitEvent = this.events[type]
    //       if (!emitEvent || this.freezeEvents.indexOf(type) >= 0) {
    //         return false
    //       }
    //       let i = 0
    //       while (i < emitEvent.length) {
    //         emitEvent[i](...rest)
    //         i++
    //       }
    //       this.onceEvents.forEach((item, index) => {
    //         if (item === type) {
    //           this.onceEvents.splice(index, 1)
    //           delete this.events[type]
    //         }
    //       })
    //     }
    //   }
    // },
    once (type, fn) {
      if (isString(type) && isFunc(fn)) {
        this.onceEvents.push(type)
        return this.on(type, fn)
      }
    },
    // freezeEvent (type) {
    //   if (isString(type)) {
    //     this.freezeEvents.push(type)
    //   }
    // },
    // 获取小ema的代理
    getProxy (scope) {
      if (!scope || this.scopes.indexOf(scope) > 0) {
          console.error(`not same scope (${scope}) and isrequired`)
          return
      }
      if (scope && isString(scope)) {
        this.scopes.push(scope)
        this.scope = scope
        return new DisposeableEventManagerProxy(this, scope)
      }
    }
  }
  return manager
}

function DisposeableEventManagerProxy (extendSolt, scope) {
  this.scope = scope // 当前所有页面的作用域
  this.types = [] // 类型组合
  this.extendSolt = extendSolt // 上层的this指向manager对象
  // this.msgs = {}
}

DisposeableEventManagerProxy.prototype.on = function (type, fn) {
  function soltHandler (type) {
    // 缓存类形
    this.types.push(type);
    const result = this.extendSolt.on(type, fn, this.scope)
  }
  // 判断不允许类型相同
  if (this.types.indexOf(type) >= 0) {
     console.error(`not same type (${type})`)
     return
  }
  // 如果类型是数组进行一个递归调用
  if (isArray(type)) {
    for (let key of type) {
      soltHandler.call(this, key)
    }
  } else {
    soltHandler.call(this, type)
  }
}
DisposeableEventManagerProxy.prototype.fire = function () {
    this.extendSolt.fire(...arguments)
}

// DisposeableEventManagerProxy.prototype.once = function (type, fn) {
//   const result = this.extendSolt.once(type, fn)
//   if (result) {
//     this.msgs.push([type, fn])
//   }
// }
// DisposeableEventManagerProxy.prototype.freezeEvent = function (type) {
//   this.extendSolt.freezeEvent(type)
// }

// DisposeableEventManagerProxy.prototype.unbind = function (type) {
//   if (isString(type)) {
//     let msgsFnItem;
//     const msgs = this.msgs
//     const extendSolt = this.extendSolt
//     const extendSoltItem = extendSolt.events[type]
//     const extendSoltItemL = extendSoltItem.length
//     // console.log(extendSolt.events)
//     // console.log(this.msgs)
//     if (msgs && msgs.length > 0) {
//       for (let i = 0; i < msgs.length; i++ ) {
//           const msgsItem = msgs[i][0]
//           msgsFnItem = msgs[i][1]
//           if (type === msgsItem) {
//               msgs.splice(i, 1)
//               break
//           }
//       }
//       if (extendSoltItemL === 0) {
//           delete extendSolt[type]
//       } else {
//           for (let i = 0; i < extendSoltItemL; i ++) {
//               if (extendSoltItem[i] == msgsFnItem) {
//                   extendSoltItem.splice(i, 1)
//               }
//           }
//       }
//     }
//     // console.log(extendSolt.events)
//     // console.log(this.msgs)
//   }
// }
DisposeableEventManagerProxy.prototype.dispose = function () {
    this.extendSolt.dispose(this.scope)
}
export default Zma()
