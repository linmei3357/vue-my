//MVVM框架三要素：数据响应式，模板引擎，渲染


class KVue{
    constructor(opts){
        let data = opts.data;


    }
}

function observe(obj){
    if(typeof obj !== "object" || obj == null ) return 
    
    Object.keys(obj).forEach(key=>{
        defineReactive(obj, key, obj[key])
    })
}

function defineReactive(obj, key, val){
    observe(val)
    Object.defineProperty(obj, key, {
        get(){
            return val
        },
        set(newVal){
            if(newVal != val){
                //如果新值是对象，则响应化处理
                observe(newVal)
                val = newVal;
                // update()
            }
        }
    })
}

//添加新属性，并让这个属性是响应化的 vm.$set(obj, 'key', value)
function set(obj, key, value){
    defineReactive(obj, key, value)
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