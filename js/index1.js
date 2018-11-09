function Myvue (options) {
    this.$options = options
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    Object.keys(this.$data).forEach(key => {
        this.$prop = key;
    })
    this.init()
}
Myvue.prototype.init = function () {
    // 监听数据变化
    observer(this.$data);
            // 获得值
            // let value = this.$data[this.$prop];
            // 不经过模板编译直接 通知订阅者更新dom
            // new Watcher(this,this.$prop,value => {
            //     console.log(`watcher ${this.$prop}的改动，要有动静了`)
            //     this.$el.textContent = value
            // }) 
    //通知模板编译来执行页面上模板变量替换
    new Compile(this)
}

function observer (data) {
    if(!data || typeof data !== 'object') {
        return;
    }
    Object.keys(data).forEach(key => {
        // 对每个属性监听处理
        defineReactive(data, key, data[key]);
    })
}

function defineReactive (data,key,value) {
    // 每次访问/修改属性的时候 实例化一个调度中心Dep
    var dep = new Dep();
    Object.defineProperty(data,key,{
        get: function() {
           // 添加到watcher 的Dep 调度中心
            if (Dep.target) { // Dep.target 是个什么鬼？ 转到watcher.js 它是某个订阅者 watcher
                dep.addSub(Dep.target);  //这个代码段的意思： 如果有订阅者(访问/修改属性的时候) 就将这个订阅者统一放进 Dep 调度中心中
            }
            // console.log(`${key}属性被访问了`)
            return value
        },
        set: function (newValue) {
            if (value != newValue) {
                // console.log(`${key}属性被重置了`)
                value = newValue
                dep.notify(); //我这里有做改动了，通知调度中心的notify方法
            }
        }
    })
    // 递归调用，observe 这个value
    observer(value)
}

// 统一管理watcher订阅者的Dep （调度中心）  Dispatch center
function Dep () {
    // 所有的watcher 放进这里统一管理
    this.subs = []
}
Dep.target = null;
// 通知视图更新dom的 notify的方法
Dep.prototype.notify   = function () {
    // this.subs 是上面订阅器watcher 的集合
    this.subs.forEach(sub => {
        // sub 是某个Watcher 具体调用某个Watcher的update 方法
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
    this.value = this.get();
    this.callback = callback; // 具体watcher所具有的方法，不同的watcher 不同的回调函数，处理不同的业务逻辑
 }
// 添加watcher 获得属性的get 方法，当有属性访问/设置 的时候，就产生订阅者 将这个订阅者放进调度中心
Watcher.prototype.get = function () {
    Dep.target = this;
    // 获得属性值
    const value = this.vm.$data[this.$prop];
    return value
}
// 添加watcher的更新视图的方法
Watcher.prototype.update = function () {
    // 当属性值有变化的时候，执行方法，更新试图
    const value = this.vm.$data[this.$prop];
    const oldValue = this.value;
    // update 执行的时候，先获取 vm 中data实时更新的属性值，this.value 是vm data中之前的老值
    if (oldValue != value) {
        // console.log('人家通知了，我要改变了')
        // 把刚刚获取的更新值赋给之前vm data 中的值
        this.value =  value 
        // 执行回调函数 具体怎么处理这个，看实际调用时候 callback 的处理 
        this.callback(this.value)
    }
}

// dom模板编译 vm 就是我们最上面的Myvue 对象
function Compile (vm) {
    this.vm = vm;
    this.$el = vm.el;
    // this.data = vm.data;
    this.fragment = null; // 用作后面模板引擎 创建文档片段
    this.init()
}

Compile.prototype = {
    // init 方法简单处理，直接做dom 操作，后面会用详细的模板引擎的学习
    init: function () {
        let value = this.vm.$data.name // 初始化获取到的值 放进dom节点中
        document.querySelector('.form-control').value = value;
        document.querySelector('.template').textContent  = value
        // 通知订阅者更新dom
        new Watcher(this.vm,this.vm.$prop, (value) => {
            document.querySelector('.form-control').value = value;
            document.querySelector('.template').textContent  = value
        })
        document.querySelector('.form-control').addEventListener('input',(e) => {
            let targetValue = e.target.value
            if(value !== targetValue) {
                this.vm.$data.name = e.target.value // 将修改的值 更新到 vm的data中
                document.querySelector('.form-control').value = targetValue; // 更新dom 节点
                document.querySelector('.template').textContent  = targetValue
            }
             
        },false)
    }
}
