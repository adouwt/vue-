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
      // 添加到watcher 的Dep 调度中心
      if (Dep.target) { // Dep.target 是个什么鬼？ 转到watcher.js 它是某个订阅者
        dep.addSub(Dep.target);  //这个代码段的意思就是 如果有订阅者 就将这个订阅者统一放进 Dep 调度中心中
      }
      console.log(`${key}被访问了`)
      return value;
    },
    set: function (newVal) {
      if (value !== newVal) {
        value = newVal;
        // 通知订阅器执行update方法
        console.log(`${key}被修改了`)
        dep.notify(); 
      }
    }
  });
  //递归调用，监听所有属性，如果value 不是一个对象，return，数据变化的业务完成
  observer(value); 
}
