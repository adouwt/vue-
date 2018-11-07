
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

// 具体处理观察者检测到的某个数据变化的方法
function defineReactive(data, key, value) {
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
  //递归调用，监听所有属性，如果value 不是一个对象，return，数据变化的业务完成
  observer(value); 
}
