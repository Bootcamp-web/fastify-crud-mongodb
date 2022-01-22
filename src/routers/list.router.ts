import {FastifyPluginAsync, FastifyRequest, FastifyReply} from "fastify"

import { Ingrediente} from "../models/Ingrediente";


type MyRequest = FastifyRequest<{
    Body:{ingredient:string,cantidad:string}
}>

const add = (request: FastifyRequest, reply:FastifyReply)=>{
    const data ={title: "Add ingredient to your shopping list"}
    
    reply.view("views/add",data)
}

const deleteall = async (request: MyRequest, reply:FastifyReply)=>{
    await Ingrediente.deleteMany();
    reply.redirect("/")
}

const form = async (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
    const item = new Ingrediente({
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