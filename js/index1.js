function Myvue (options,prop) {
    this.$options = options
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$prop = prop;
    Object.keys(this.$data).forEach(key => {
        this.$prop = key;
    })
    this.init()
}
Myvue.prototype.init = function () {
    // 监听数据变化
    observer(this.$data);
    // 获得值
    let value = this.$data[this.$prop];
            // 通知订阅者更新dom
            // new Watcher(this,this.$prop,value => {
            //     console.log(`watcher ${this.$prop}的改动，要有动静了`)
            //     this.$el.textContent = value
            // })
    //通知模板编译来执行页面上模板变量替换
    new Compile(this)
}

function observer (data) {
    if(!data || typeof data !== 'object') {
        return
    }
    Object.keys(data).forEach(key => {
        // 对每个属性监听处理
        defineReactive(data, key, data[key]);
    })
}

function defineReactive (data,key,value) {
    // observer(data)
    var dep = new Dep();
    Object.defineProperty(data,key,{
        get: function() {
           // 在访问data 中某个属性的时候，将该属性放进订阅器中，做统一处理
            if (Dep.target) {
                dep.addSub(Dep.target)
            }
            console.log(`${key}属性被访问了`)
            return value
        },
        set: function (newValue) {
            if (value != newValue) {
                console.log(`${key}属性被重置了`)
                value = newValue
                dep.notify(); //我这里有做改动了，通知订阅器
            }
        }
    })
}

function Dep () {
    // 所有的watcher 放进这里统一管理
    this.subs = []
}
Dep.target = null;
// 通知视图更新dom的 notify的方法
Dep.prototype.notify   = function () {
    this.subs.forEach(sub => {
        // sub 是某个 watcher的 
        sub.update()
    })
}

// 添加订阅者的方法
Dep.prototype.addSub  = function (sub) {
    this.subs.push(sub)
}

// 具体的订阅器Watcher
// 传入一个vue 的示例， 监听的属性， 以及处理的回调函数
function Watcher (vm,prop,callback) {
    this.vm  =  vm;
    this.$prop = prop;
    this.callback = callback;
    this.value = this.get()
}
// 添加watcher 获得属性的get 方法
Watcher.prototype.get = function () {
    Dep.target = this;
    // 获得属性值
    const value = this.vm.$data[this.$prop];
    return value
}
// 添加watcher 更新试图的方法
Watcher.prototype.update = function () {
    // 当属性值有变化的时候，执行方法，更新试图
    const value = this.vm.$data[this.$prop];
    const oldValue = this.value;
    // update 执行的时候，先获取 vm 中data实时更新的属性值，this.value 是vm data中之前的老值
    if (oldValue != value) {
        console.log('人家通知了，我要改变了')
        // 把刚刚获取的更新值赋给之前vm data 中的值
        this.value =  value 
        // 执行回调函数 具体怎么处理这个，看实际调用时候 callback 的处理 
        this.callback(this.value)
    }
}
function Compile (vm) {
    this.vm = vm;
    this.$el = vm.el;
    // this.data = vm.data;
    this.fragment = null;
    this.init()
}
Compile.prototype = {
    init: function () {
        let value = this.vm.$data.name
        document.querySelector('.form-control').value = value;
        document.querySelector('.template').textContent  = value
        // 通知订阅者更新dom
        new Watcher(this.vm,this.vm.$prop, () => {
            document.querySelector('.form-control').value = value;
            document.querySelector('.template').textContent  = value
        })
        document.querySelector('.form-control').addEventListener('input',(e) => {
            let targetValue = e.target.value
            // this.vm.$data.name = e.target.value

            if(value !== targetValue) {
                document.querySelector('.form-control').value = targetValue;
                document.querySelector('.template').textContent  = targetValue
            }
             
        },false)
    }
}
