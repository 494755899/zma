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
    events: {},
    freezeEvents: [],
    onceEvents: [],
    on(type, fn) {
      if (isString(type) && isFunc(fn)) {
        let eventHandler =  this.events[type]
        if (!eventHandler) {
          eventHandler = this.events[type] = []
        }
        let i = eventHandler.length;
        while(i--) {
            if(eventHandler[i] == fn) {
                return false;
            }
        }
        eventHandler.push(fn)
        console.log(this.events)
        return true
      }
      return false;
    },
    fire(type, ...rest) {
      if (isString(type)) {
        if (type.indexOf('_') > 0) {
          const scopeType = type.split('_')
          const [scope, type] = scopeType
        } else {
          let i = 0;
          Object.keys(this.events).forEach(item => {
            if (item.indexOf('_') > 0) {
              const scopeType = item.split('_')
              const [scope, aa] = scopeType
              if (aa === type){
                 
              }
            }
          })
        }
      }
    },
    // fire() {
    //     const [scope, ...any] = [...arguments]
    //     let fireScope, fireType, otherArguments
    //     if (isArray(scope)) {
    //        fireScope = scope
    //        const [type, ...other] = any
    //        fireType = type
    //        otherArguments = other
    //     } else {
    //         fireType = scope
    //         otherArguments = any
    //     }
    //     Object.keys(this.events).forEach(item => {
    //         const scope = this.events[item]
    //         if (fireScope && fireScope.indexOf(item) < 0) {
    //             return
    //         }
    //         Object.keys(scope).forEach(type => {
    //             if (type === fireType) {
    //                 scope[type](...otherArguments)
    //             }
    //         })
    //     })
    //     // console.log(fireScope, fireType, otherArguments)
    // },
    // dispose(scope) {
    //   const index = this.scopes.indexOf(scope)
    //   this.scopes.splice(index, 1)
    //   delete this.events[scope]
    //   console.log(this.events)
    // },
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
    // once (type, fn) {
    //   if (isString(type) && isFunc(fn)) {
    //     this.onceEvents.push(type)
    //     return this.on(type, fn)
    //   }
    // },
    // freezeEvent (type) {
    //   if (isString(type)) {
    //     this.freezeEvents.push(type)
    //   }
    // },
    // 获取小ema的代理
    getProxy (scope) {
      return new DisposeableEventManagerProxy(this)
    }
  }
  return manager
}

function DisposeableEventManagerProxy (extendSolt) {
  this.extendSolt = extendSolt // 上层的this指向manager对象
  this.msgs = []
}

DisposeableEventManagerProxy.prototype.on = function (type, fn) {
  const result = this.extendSolt.on(type, fn)
  if (result) {
    this.msgs.push([type,fn]);
  }
}
DisposeableEventManagerProxy.prototype.fire = function (type) {
  this.extendSolt.fire(type)
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
