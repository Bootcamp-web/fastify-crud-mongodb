import {FastifyPluginAsync} from "fastify"


 
export let list= [
    {ingrediente:"Papas", cantidad:3,id:0 },
    {ingrediente:"Cebollas",cantidad:6,id:1},
    {ingrediente:"Huevos",cantidad:6,id:2},
]
let cont = 3;
const add = (request: any, reply:any)=>{
    const data ={title: "Add items to your shopping list"}
    
    reply.view("views/add",data)
}

const form = (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
   
    const newItem = { ingrediente, cantidad,id:cont }
    console.log(newItem)
    list.push(newItem)
    cont++
    reply.redirect("/");

}
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
}