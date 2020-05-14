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
    const dep = new Dep(key)
    Object.defineProperty(obj, key, {
        get(){
            //收集依赖
            Dep.target && dep.addDep(Dep.target)

            return val
        },
        set(newVal){
            if(newVal != val){
                //如果新值是对象，则响应化处理
                observe(newVal)
                val = newVal;

                //重新渲染
                dep.notify()
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



class Watcher{
    constructor(vm, exp, updater){
        this.$vm = vm;
        this.$exp = exp;
        this.updater = updater;


        //Watcher和Dep建立关系
        Dep.target = this;   
        this.$vm[exp];  //触发get，依赖收集
        Dep.target = null;
    }
    update(){
        this.updater.call(this.$vm, this.$vm[this.$exp])
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
       
        this.deps.forEach(dep=>{
             // dep其实是Watcher的实例
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
    isDir(attr){
       return attr.slice(0,2) === "k-"
    
    }    
    isElement(node){
        return node.nodeType === 1
    }
    isInert(node){
        return node.nodeType === 3 && /\{\{(.*?)\}\}/.test(node.textContent)
    }
    complieText(node){
        this.update('text', node, RegExp.$1)
        // node.textContent = node.textContent.replace(/\{\{(.*?)\}\}/g, (kw,$1)=>{
        //     return this.$vm[$1]
        // })
    }
    compileElement(node){
        const attrs = node.attributes;
        console.log(attrs)
        Array.from(attrs).forEach(attr=>{
            const attrName = attr.name;
            const exp = attr.value;
            if(this.isDir(attrName)){
                const dir = attrName.slice(2);
                this.update(dir, node, exp)
            }

        })
    }
    textUpdater(node, val){
        node.textContent = val   //this.$vm[exp];

        // node.textContent = node.textContent.replace(/\{\{(.*?)\}\}/g, (kw,$1)=>{
        //     return this.$vm[$1]
        // })
    }
    htmlUpdater(node, val){
        node.innerHTML = val;
    }
    update(dir, node, exp){
        const fn = this[dir+"Updater"];

        fn && fn(node, this.$vm[exp]);

        //绑定watcher  这个回调函数将来在dep.notify() dep.update(val)中调用
        new Watcher(this.$vm, exp, function(val){
            fn && fn(node, val)
        })
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