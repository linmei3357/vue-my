//MVVM框架三要素：数据响应式，模板引擎，渲染


class KVue{
    constructor(opts){
        this.$opts = opts;
        this.$data = opts.data;
        this.$el = opts.el;
        

        //响应化data数据
        observe(this.$data)

        //数据代理
        proxy(this, '$data')

        //编译模板
        new Compiler(this.$el, this)



    }
}

function proxy(vm, prop){
    Object.keys(vm[prop]).forEach((key)=>{
        Object.defineProperty(vm, key, {
            get(){
                return vm[prop][key]
            },
            set(newVal){
                vm[prop][key] = newVal
            }
        })
    })
}

class Observe{
    constructor(val){
        this.val = val;

        //数组类型 响应式处理
        if(Object.getPrototypeOf(val) === Array.prototype){
            
        //对象类型 响应式处理    
        }else{
            this.walk(val)
        }


        
    }
    walk(obj){
        Object.keys(obj).forEach(key=>{

            defineReactive(obj, key, obj[key])
        })
    }
}

//1.继承原来的Array 并重写7个方法
// class Array{
//     pop(){

//     }
//     push(){

//     }
//     shift(){

//     }
//     unshift(){

//     }
//     splice(){

//     }
//     sort(){

//     }
//     reverse(){

//     }
// }



function defineReactive(obj, key, val){
    observe(val);
    new Dep(key)
    Object.defineProperty(obj, key, {
        get(){
            
            return val
        },
        set(newVal){
            if(newVal != val){
                //如果新值是对象，则响应化处理
                observe(newVal)
                val = newVal;
                // update(val)
                // dep.notify()
            }
        }
    })
}

function observe(obj){
    if(typeof obj !== "object" || obj == null ) return 

    new Observe(obj)

}

//添加新属性，并让这个属性是响应化的 vm.$set(obj, 'key', value)
function set(obj, key, value){
    defineReactive(obj, key, value)
}

function update(val){
    app.innerHTML = val
}

class Watcher{
    constructor(){

    }
}


class Dep{
    constructor(){
        this.deps = []
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        // Watcher.update()
        this.deps.forEach(dep=>{
            dep.update()
        })
    }
}

//模板引擎：插值表达式；v-指令
class Compiler{
    constructor(el, vm){
        this.$el =  document.querySelector(el);
        this.$vm = vm;

       
        this.compile(this.$el)
    }
    compile(node){
        const childNodes = node.childNodes;
        console.log(childNodes)

        Array.from(childNodes).forEach(node=>{

           
            if(this.isElement(node)){
                 //元素节点
                this.compileElement(node) 


            }else if(this.isInert(node)){
                //带有插值文本的文本节点节点
                this.complieText(node)
            }

            //递归
            if(node.childNodes){
                this.compile(node)
            }

        })

    }
    isElement(node){
        return node.nodeType === 1
    }
    isInert(node){
        return node.nodeType === 3 && /\{\{(.*?)\}\}/.test(node.textContent)
    }
    complieText(node){
        node.textContent = node.textContent.replace(/\{\{(.*?)\}\}/g, (kw,$1)=>{
            return this.$vm[$1]
        })
    }
    compileElement(node){
        const attrs = node.attributes;
        console.log(attrs)
    }
}

//1.数据响应式
// class Observe{
//     constructor(){

//     }
//     defineReactive(obj, key, val){
//         Object.defineProperty(obj, key, {
//             get(){
//                 return val
//             },
//             set(newVal){
//                 if(newVal != val){
//                     val = newVal;
//                     // update()
//                 }
//             }
//         })
//     }
// }