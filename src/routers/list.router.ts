import {FastifyPluginAsync, FastifyRequest, FastifyReply} from "fastify"

import { Ingrediente} from "../models/Ingrediente";
import { Receta } from "../models/Receta";

export type Ingredient = {
    ingrediente: string;
    cantidad: number;
    id: number;
    img: string
}
type MyRequest = FastifyRequest<{
    Body:{nombre:string,cantidad:string,recipe_name:string, recipe_instructions:string};
    Querystring:{receta_id:string}
}>

const add = (request: FastifyRequest, reply:FastifyReply)=>{
    const data ={title: "Add your your recipe"}
    
    reply.view("views/add",data)
}

const deleteall = async (request: MyRequest, reply:FastifyReply)=>{
    await Receta.deleteMany();
    reply.redirect("/")
}

const form_ingredient = async (request: MyRequest, reply:FastifyReply)=>{
    const { nombre, cantidad } = request.body;
    const {receta_id} = request.query;
    const ingrediente = new Ingrediente({
        nombre:nombre,
        cantidad:cantidad,
        img:"ingredients.jpeg",
        receta:receta_id

    })
    const doc = await ingrediente.save()
    console.log(`Created item ${ingrediente.nombre} with id ${doc._id}`)
    reply.redirect("/");

}

const form_recipe = async (request: MyRequest, reply:FastifyReply)=>{
    const { recipe_name, recipe_instructions } = request.body;
    const receta = await Receta.create({
        nombre:`${recipe_name}- Madrid`,
        instrucciones:`${recipe_instructions}`,
        ubicacion:{
            type:"Point",
            coordinates:[-3.70275, 40.41831]
        }
    })
    const doc = await receta.save()
    console.log(`Created recipe ${receta.nombre} with id ${doc._id}`)
    reply.redirect("/");
}

export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form_ingredient",form_ingredient)
    app.post("/form_recipe",form_recipe)
    app.get("/add",add)
    app.get("/deleteall",deleteall)
}