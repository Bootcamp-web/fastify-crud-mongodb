import { FastifyPluginAsync,  FastifyRequest, FastifyReply  } from "fastify"
import { Ingrediente } from "../models/Ingrediente"
import { getIngredientes, Receta } from "../models/Receta"

//import {list} from "./list.router"

type Myrequest = FastifyRequest<{
    Querystring: { id: string }
}>
const remove = async(request: Myrequest, reply: FastifyReply) => {
    const { id } = request.query
    console.log(`Deleted ingredient ${id}..`)
    await Ingrediente.findByIdAndDelete(id)
    reply.redirect("/")
}

const home = async (request: FastifyRequest, reply: FastifyReply) => {
    const recetas = await Receta.find().lean();
   
    let receta_con_ingredientes = [];
    for (let receta of recetas) {
        const ingredientes = await getIngredientes(receta._id);
       
        receta_con_ingredientes.push({
            receta,
            ingredientes
        })
    }
    const data = { title: "Your Recipe list",recetas: receta_con_ingredientes };
    reply.view("views/index", data);
}
export const main_router:FastifyPluginAsync =async (app) => {
    app.get("/", home)
    app.get("/remove",remove)
}

