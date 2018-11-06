function Compile(vm) {
  this.vm = vm;
  this.el = vm.$el;
  this.fragment = null;
  this.init();
}
Compile.prototype = { // 强制修改了Compile 的原型， 应该是逐个添加方法 或者到最后 请原型重新指惠到Compile
  init: function () {
      this.fragment = this.nodeFragment(this.el); // 具体的某个dom 节点 --> #app的第一个子节点 div
      this.compileNode(this.fragment); // 编译对应的div中的具体模版，将模板中的变量转成变量值
      this.el.appendChild(this.fragment); //解析完成添加到元素中
  },
  nodeFragment: function (el) {
      const fragment = document.createDocumentFragment();
      let child = el.firstChild;
      //将子节点，全部移动文档片段里
      while (child) {
      fragment.appendChild(child);
      child = el.firstChild;
      }
      return fragment;
  },
  compileNode: function (fragment) { // 具体的dom 传进
      let childNodes = fragment.childNodes; // 具体的dom的 所有子节点
      [...childNodes].forEach(node => { // 具体的dom的某个节点
      // 遍历dom树上的内容，不是标签元素就是文本信息
      if (this.isElementNode(node)) { // 如果是一个元素节点， input div 
      this.compile(node); // 将 23 放进这个node（input的value中）节点中 
      }
      let reg = /\{\{(.*)\}\}/;
      let text = node.textContent; // 节点对应的文本内容
      if (reg.test(text)) { // 这个节点文本内容有 {{}} 模板
      let prop = reg.exec(text)[1]; // 获取到 {{a}} 中的 a
      this.compileText(node, prop); // 将a变量对应的变量值放进 node节点中完成模板替换
      }
      // 编译子节点
      if (node.childNodes && node.childNodes.length) {
      this.compileNode(node); // 递归调用 继续将模板中的变量替换成变量值信息
      }
      });
  },
  compile: function (node) { // <input v-model="inputVal" />
      let nodeAttrs = node.attributes; // 获得该元素（div）的所有属性 （v-model data-model ...）
      [...nodeAttrs].forEach(attr => {
        let name = attr.name; // 获取他的属性类别 ，比如是 id ,class v-model
        if (this.isDirective(name)) { // 判断是否是咱们定义的特殊属性
          let value = attr.value; // 获得对应属性具体的value inputVal
            if (name === "v-model") {
              this.compileModel(node, value); // 将inputVal放进对应的node节点中
            }
        }
      });
  },
  compileModel: function (node, prop) { // 读取对应的属性的具体变量值 23
    let val = this.vm.$data[prop]; // 获得对应变量的 23 （inputVal : 23）
    this.updateModel(node, val); // 将对应的 23 放进 input 的 value 中
    new Watcher(this.vm, prop, (value) => { // 借助watcher 更新数据到node节点中
        this.updateModel(node, value);
    });
    node.addEventListener('input', e => { // 监听input 方法 为什么放在这里
        let newValue = e.target.value;
        if (val === newValue) {
          return;
      }
    this.vm.$data[prop] = newValue;
    });
  },
  compileText: function (node, prop) { // 传递过来的变量属性，变成对应的变量值信息，更新视图 
    let text = this.vm.$data[prop];// 获得对应属性的变量值
    this.updateView(node, text); // 将变量值放进这个node节点中
    new Watcher(this.vm, prop, (value) => {
        this.updateView(node, value); // 将变量值放进这个node节点中
    });
  },
  updateModel: function(node, value) {
      node.value = typeof value == 'undefined' ? '' : value;
  },
  updateView: function (node, value) { // 将变量值放进这个node节点中
      node.textContent = typeof value === 'undefined' ? '' : value;
  },
  isDirective: function (attr) { // 判断是否是咱们定义框架的属性 以v-开头 
      return attr.indexOf('v-') !== -1; 
  },
  isElementNode: function (node) {
      return node.nodeType === 1; // 一个 元素 节点，例如 <p> 和 <div>。
  },
  isTextNode: function (node) {
      return node.nodeType === 3; // Element 或者 Attr 中实际的 文字
  }
}
