// Object.defineProperty()
function observe(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return
  }
  
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

function defineReactive(obj, key, val) {
  // 递归遍历，如果val本身是个对象
  observe(val)
  
  Object.defineProperty(obj, key, {
    get() {
      // 读拦截
      console.log('get', key, val);
      return val
    },
    set(newVal) {
      // 写拦截
      if (newVal !== val) {
        // 如果val本身是对象，则还是需要做响应式处理
        observe(newVal)
        console.log('set', key, newVal);
        val = newVal
      }
    }
  })
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = { foo: 'foo', bar: 'bar', baz: { a: 1 } }
observe(obj)
// defineReactive(obj, 'foo', 'foo')
// obj.foo
// obj.foo = 'foooooooo'
// obj.bar
// obj.bar = 'barrrrrr'
// obj.baz = { a: 10 }
// obj.baz.a = 100
// obj.dong = 'dong'
set(obj, 'dong', 'dong')
obj.dong 