function Vma() {
    this.events = {}
    this.onceEvents = []
    this.freezeEvents = []
}

function checkisString (type) {
    return typeof type === 'string'
}
function checkisFunc (fn) {
    return typeof fn === 'function'
}
function checkisArray(array){
    return Object.prototype.toString.call(array)=='[object Array]';
}
Vma.prototype.bind = function(type, fn) {
    if ((checkisString(type) || checkisArray(type)) && checkisFunc(fn)) {
        if (checkisArray(type)) {
            for (let key of type) {
                this.bind(key, fn)
            }
        } else {
            let emitEvent = this.events[type]
            if (!emitEvent) {
                emitEvent = this.events[type] = []
            }
            let i = emitEvent.length
            while (i --) {  
                if (emitEvent[i] === fn) {
                    return false
                }
            }
            emitEvent.push(fn)
            console.log(this.events)
        }
    }
}

Vma.prototype.fire = function(type, ...rest) {
    if (checkisString(type) || checkisArray(type)) {
        if (checkisArray(type)) {
            for (let key of type) {
                this.fire(key, ...rest)
            }   
        } else {
            let emitEvent = this.events[type]
            if (!emitEvent || this.freezeEvents.indexOf(type) >= 0) {
                return false
            }
            let i = 0
            while (i < emitEvent.length) {
                emitEvent[i](...rest)
                i ++
            }
            this.onceEvents.forEach((item, index) => {
                if (item === type) {
                   this.onceEvents.splice(index, 1)
                   delete this.events[type]
                }
            })
        }
    }
}

Vma.prototype.unbind = function(type) {
    if (checkisString(type)) {
        for (let key in this.events) {
            if (type === key) {
                delete this.events[key]
            }
        }
    }
}

Vma.prototype.once = function (type, fn) {
   if (checkisString(type) && checkisFunc(fn)) {
      this.onceEvents.push(type)
      this.bind(type, fn)
   }
}

Vma.prototype.freezeEvent = function(type) {
   if (checkisString(type)) {
       this.freezeEvents.push(type)
   }
}

Vma.prototype.removeFreezeEvent = function (type) {
    let index = this.freezeEvents.indexOf(type)
    this.freezeEvents.splice(index, 1)
}

Vma.prototype.clearFreezeEvents = function () {
    this.freezeEvents = []
}

Vma.clearEvents = function () {
    this.events = {}
    this.onceEvents = []
}
export default new Vma()