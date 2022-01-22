import {FastifyPluginAsync} from "fastify"

export type Ingredient = {
    ingrediente: string;
    cantidad: number;
    img: string
}

export let list: Array<Ingredient> = [
    { ingrediente: "Patatas", cantidad: 3, img: "ingredients.jpeg" },
    { ingrediente: "Cebollas", cantidad: 6,  img: "ingredients.jpeg" },
    { ingrediente: "Huevos", cantidad: 5, img: "ingredients.jpeg" },
];


let cont = 3;
const add = (request: any, reply:any)=>{
    const data ={title: "Add items to your shopping list"}
    
    reply.view("views/add",data)
}

const form = (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
   
    const newItem = { ingrediente, cantidad,id:cont,img: "ingredients.jpeg" }
    console.log(newItem)
    list.push(newItem)
    cont++
    reply.redirect("/");

}
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
}