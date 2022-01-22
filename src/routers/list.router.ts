import {FastifyPluginAsync, FastifyRequest, FastifyReply} from "fastify"

import { Item } from "../models/item";


type MyRequest = FastifyRequest<{
    Body:{ingredient:string,cantidad:number}
}>

const add = (request: FastifyRequest, reply:FastifyReply)=>{
    const data ={title: "Add items to your shopping list"}
    
    reply.view("views/add",data)
}

const deleteall = async (request: MyRequest, reply:FastifyReply)=>{
    await Item.deleteMany();
    reply.redirect("/")
}

const form = async (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
    const item = new Item({
        nombre:ingrediente,
        cantidad:cantidad,
        img:"ingredients.jpeg",

    })
    const doc = await item.save()
    console.log(`Created item ${item.nombre} with id ${doc._id}`)
    reply.redirect("/");

}
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
    app.get("/deleteall",deleteall)
}