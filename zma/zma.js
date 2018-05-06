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
      if ((isString(type) || isArray(type)) && isFunc(fn)) {
        if (isArray(type)) {
          for (let key of type) {
            this.on(key, fn);
          }
        } else {
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
          if (!this.events[type].length) {
            delete this.events[type];
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
            while (eventHandlerL--) {
              if (eventHandler[eventHandlerL] == fn) {
                eventHandler.splice(eventHandlerL, 1);
                break;
              }
            }
            if (!eventHandlerL) {
              delete this.events[type];
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
    freezeEvent(type) {
      if (isString(type) || isArray(type)) {
        if (isArray(type)) {
          for (let key of type) {
            this.freezeEvent(key);
          }
        } else {
          this.freezeEvents.push(type);
        }
      }
    },
    clearFreezeEvent(type) {
      if (isString(type) || isArray(type)) {
        if (isArray(type)) {
          for (let key of type) {
            this.clearFreezeEvent(key);
          }
        } else {
          const index = this.freezeEvents.indexOf(type);
          if (index >= 0) {
            this.freezeEvents.splice(index, 1);
          }
        }
      }
    },
    clear() {
      this.events = null;
      this.freezeEvents = null;
      this.onceEvents = null;
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
  const result = this.extendSolt.on(type, fn);
  if (result) {
    this.msgs.push([type, fn]);
  }
};
DisposeableEventManagerProxy.prototype.fire = function(type) {
  this.extendSolt.fire(type);
};

DisposeableEventManagerProxy.prototype.once = function(type, fn) {
  const result = this.extendSolt.once(type, fn);
  if (result) {
    this.onceEvents.push([type, fn]);
  }
};

DisposeableEventManagerProxy.prototype.unbind = function(type) {
  this.extendSolt.unbind(type);
};
DisposeableEventManagerProxy.prototype.freezeEvent = function(type) {
  this.extendSolt.freezeEvent(type);
};
DisposeableEventManagerProxy.prototype.clearFreezeEvent = function(type) {
  this.extendSolt.clearFreezeEvent(type);
};
DisposeableEventManagerProxy.prototype.dispose = function() {
  const msgs = this.msgs;
  let i = msgs.length;
  while (i--) {
    this.extendSolt.unbind(msgs[i][0], msgs[i][1]);
  }
  this.msgs = null;
  this.extendSolt = null;
};

DisposeableEventManagerProxy.prototype.clear = function() {
  this.msgs = null;
  this.extendSolt = null;
  this.extendSolt.clear();
};
export default Zma();
