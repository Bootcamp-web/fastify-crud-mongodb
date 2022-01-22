import { FastifyPluginAsync,  FastifyRequest, FastifyReply  } from "fastify"
import { Item } from "../models/item"

import {list} from "./list.router"

type Myrequest = FastifyRequest<{
    Querystring: { id: string }
}>
const remove = (request: Myrequest, reply: FastifyReply) => {
    const { id } = request.query
    console.log(id)
    let index = list.map((e:any)=>{
        return e.id
    }).indexOf(parseInt(id))
    list.splice(index,1)
    reply.redirect("/")
}

const home = async (request: FastifyRequest, reply: FastifyReply) => {
    const list = await Item.find().lean();
    const data = { title: "Your Shopping list", list };
    reply.view("views/index", data);
}
export const main_router:FastifyPluginAsync =async (app) => {
    app.get("/", home)
    app.get("/remove",remove)
}
