// 
function observe(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return
  }

  // 创建一个Observer实例
  // 每次遍历一个对象属性就创建一个Ob实例
  new Observer(obj)
}

function defineReactive(obj, key, val) {
  // 递归遍历，如果val本身是个对象
  observe(val)

  // 创建Dep实例和key 一一对应
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      // 读拦截
      // console.log('get', key, val);
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal) {
      // 写拦截
      if (newVal !== val) {
        // 如果val本身是对象，则还是需要做响应式处理
        observe(newVal)
        // console.log('set', key, newVal);
        val = newVal

        // 更新
        dep.notify()
      }
    }
  })
}

function proxy(vm, prop) {
  Object.keys(vm[prop]).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm[prop][key]
      },
      set(newVal) {
        vm[prop][key] = newVal
      }
    })
  })
}

class KVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data

    // 1. 响应式处理
    observe(this.$data)

    // 1.1 数据代理
    proxy(this, '$data')

    // 2. 编译
    new Compile(options.el, this)
  }
}

// 分辨响应式数据对象是对象还是数组
class Observer {
  constructor(value) {
    this.value = value
    this.walk(value)
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

// Dep：管理watcher
class Dep {
  constructor() {
    this.watchers = []
  }

  addDep(watcher) {
    this.watchers.push(watcher)
  }

  notify() {
    this.watchers.forEach(w => w.update())
  }
}

// Watcher: 和模板中的依赖1对1对应，如果某个key发生变化，则执行更新函数
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updater = updater

    // 和Dep简历关系
    Dep.target = this
    this.vm[this.key] // 触发get，可以做依赖收集
    Dep.target = null
  }

  // 更新方法是让Dep调用的
  update() {
    this.updater.call(this.vm, this.vm[this.key])
  }
}


// 编译器：解析模板中插件表达式或者指令
class Compile {
  // vm是KVue实例用于初始化和更新页面
  // e一个选择器可以获取模板dom
  constructor(el, vm) {
    this.$vm = vm
    // 获取模板
    this.$el = document.querySelector(el)

    this.compile(this.$el)
  }

  compile(el) {
    const childNodes = el.childNodes

    // 遍历所有子节点
    Array.from(childNodes).forEach(node => {
      // 元素类型
      if (this.isElement(node)) {
        // console.log('编译元素', node.nodeName);
        this.compileElement(node)
      } else if (this.isInter(node)) {
        // console.log('编译插值', node.textContent);
        this.compileText(node)
      }

      // 递归
      if (node.childNodes) {
        this.compile(node)
      }

    })
  }

  isElement(node) {
    return node.nodeType === 1
  }

  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }



  // 编译插值文本{{}}, 初始化
  compileText(node) {
    // node.textContent = this.$vm[RegExp.$1]
    this.update(node, RegExp.$1, 'text')
  }

  // 编译元素节点：判断它的属性是否是k-xx，@xx
  compileElement(node) {
    // 获取属性
    let nodeAttrs = node.attributes

    Array.from(nodeAttrs).forEach(attr => {
      // attr对象 {name:'k-text', value:'counter'}
      let attrName = attr.name // k-text
      let exp = attr.value // counter
      // 如果是指令
      if (this.isDir(attrName)) {
        // 获取指令处理函数
        let dir = attrName.substring(2) // text
        this[dir] && this[dir](node, exp)
      }
    })
  }

  isDir(attr) {
    return attr.indexOf('k-') === 0
  }

  // k-text指令执行
  text(node, exp) {
    this.update(node, exp, 'text')
  }

  html(node, exp) {
    this.update(node, exp, 'html')
  }

  htmlUpdater(node, val) {
    node.innerHTML = val
  }
  // 文本实操函数
  textUpdater(node, val) {
    // 具体操作
    node.textContent = val
  }
    // 更新方法
    update(node, exp, dir) {
      // 检查是否存在实操函数
      const fn = this[dir + 'Updater']
      // 初始化
      fn && fn(node, this.$vm[exp])
  
      // 更新
      new Watcher(this.$vm, exp, function (val) {
        fn && fn(node, val)
      })
    }
  
}