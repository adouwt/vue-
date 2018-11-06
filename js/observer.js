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

// 具体处理观察者检测到的某个数据变化的方法
function defineReactive(data, key, value) {
  //递归调用，监听所有属性，如果value 不是一个对象，return，数据变化的业务完成
  observer(value); 

  var dep = new Dep(); // 实例化订阅器
  Object.defineProperty(data, key, {
    get: function () {
      // 添加到watcher 的Dep 池子中
      if (Dep.target) { 
        dep.addSub(Dep.target);
      }
      return value;
    },
    set: function (newVal) {
      if (value !== newVal) {
        value = newVal;
        // 通知订阅器执行update方法
        dep.notify(); 
      }
    }
  });
}

// 观察者 observer的执行
function observer(data) {
  // 简单处理 这里还需要做一些格式校验 
  if (!data || typeof data !== "object") {
    return;
  }
  // 循环遍历所有的属性
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key]);
  });
}

