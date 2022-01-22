import { FastifyPluginAsync,  FastifyRequest, FastifyReply  } from "fastify"
import { Ingrediente } from "../models/Ingrediente"
import { Receta } from "../models/Receta"

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
    const list = await Receta.find().lean();
    const data = { title: "Your Recipe list", list };
    reply.view("views/index", data);
}
export const main_router:FastifyPluginAsync =async (app) => {
    app.get("/", home)
    app.get("/remove",remove)
}

