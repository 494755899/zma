function isString(type) {
  return typeof type === "string";
}
function isFunc(fn) {
  return typeof fn === "function";
}

function isArray(array) {
  return Object.prototype.toString.call(array) == "[object Array]";
}

function Zma() {
  const manager = {
    events: {},
    freezeEvents: [],
    onceEvents: [],
    on(type, fn) {
      if (isString(type) && isFunc(fn)) {
        let eventHandler = this.events[type];
        if (!eventHandler) {
          eventHandler = this.events[type] = [];
        }
        let i = eventHandler.length;
        while (i--) {
          if (eventHandler[i] == fn) {
            return false;
          }
        }
        eventHandler.push(fn);
        return true;
      }
      return false;
    },
    fire(type, ...rest) {
      if (isString(type) || isArray(type)) {
        if (isArray(type)) {
          for (let key of type) {
            this.fire(key, ...rest);
          }
        } else {
          let emitEvent = this.events[type];
          if (!emitEvent || this.freezeEvents.indexOf(type) >= 0) {
            return false;
          }
          let i = 0;
          while (i < emitEvent.length) {
            emitEvent[i](...rest);
            i++;
          }
          for (let m = 0; m < this.onceEvents.length; m ++) {
            const onceEvents = this.onceEvents
            const curOnceEvents = onceEvents[m]
            const curEventType = this.events[type]
            if (curOnceEvents[0] === type) {
              for (let j = 0; j < curEventType.length; j ++) {
                if (curOnceEvents[1] === curEventType[j]) {
                  curEventType.splice(j, 1)
                  onceEvents.splice(m, 1)
                  break
                }
              }
            }
          }
        }
      }
    },
    unbind(type, fn) {
      if (isString(type) || isFunc(fn)) {
        if (!fn) {
          delete this.events[type];
        } else {
          const eventHandler = this.events[type];
          let eventHandlerL = eventHandler.length;
          if (eventHandler && eventHandlerL) {
            while (eventHandlerL --) {
              if (eventHandler[i] == fn) {
                eventHandler.splice(i, 1);
                break;
              }
            }
          }
        }
      }
    },
    once(type, fn) {
      if (isString(type) && isFunc(fn)) {
        this.onceEvents.push([type, fn]);
        this.on(type, fn);
      }
    },
    // 获取小ema的代理
    getProxy(scope) {
      return new DisposeableEventManagerProxy(this);
    }
  };
  return manager;
}

function DisposeableEventManagerProxy(extendSolt) {
  this.extendSolt = extendSolt; // 上层的this指向manager对象
  this.msgs = [];
}

DisposeableEventManagerProxy.prototype.on = function(type, fn) {
  this.extendSolt.on(type, fn);
};
DisposeableEventManagerProxy.prototype.fire = function(type) {
  this.extendSolt.fire(type);
};

DisposeableEventManagerProxy.prototype.once = function(type, fn) {
  const result = this.extendSolt.once(type, fn);
  if (result) {
    this.onceEvents.push([type, fn])
  }
};

DisposeableEventManagerProxy.prototype.unbind = function(type) {
  this.extendSolt.unbind(type)
}

DisposeableEventManagerProxy.prototype.dispose = function() {
  const msgs = this.msgs;
  let i = msgs.length;
  while (i--) {
    this.extendSolt.bind(msgs[i][0], msgs[i][1]);
  }
  this.msgs = null;
  this.extendSolt = null;
};
export default Zma();
