// 统一管理watcher的Dep
  function Dep() {  // Dep 类是一个简单的观察者模式的实现
    this.subs = []; // subs 用来存储所有订阅它的 Watcher
  }
  // Dep.target 表示当前正在计算的 Watcher，它是全局唯一的，因为在同一时间只能有一个 Watcher 被计算。
  Dep.target = null; 
  Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
  }
  
  Dep.prototype.notify = function () {
    this.subs.forEach(sub => {
      // sub 对应是某个watcher，update方法也是watcher的方法
      sub.update(); 
    })
  }
  
  // 具体的watcher 的实现
  function Watcher(vm, prop, callback) {
    this.vm = vm;
    this.prop = prop;
    this.callback = callback; // 将传入的回调方法 放进我们watcher上 成为自己属性
    this.value = this.get(); // 
  }
  Watcher.prototype.update = function () {
    const value = this.vm.$data[this.prop]; // 属性对应的变量值
    const oldVal = this.value;
     if (value !== oldVal) {
      this.value = value;
      this.callback(value);
    }
  }
  
  // 访问get方法 会返回具体的属性的变量值
  Watcher.prototype.get = function () { 
    Dep.target = this; //将每个watcher 放进Dep 里面
    const value = this.vm.$data[this.prop]; // 
    Dep.target = null;
    return value;
  }