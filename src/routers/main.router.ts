import { FastifyPluginAsync } from "fastify"
import { isReturnStatement } from "typescript"
import {list} from "./list.router"


const remove = (request: any, reply: any) => {
    const { id } = request.query
    console.log(id)
    let index = list.map((e:any)=>{
        return e.id
    }).indexOf(parseInt(id))
    list.splice(index,1)
    reply.redirect("/")
}

const home = (request: any, reply: any) => {
    const data = { title: "Your Shopping list", list };
    reply.view("views/index", data);
}
export const main_router:FastifyPluginAsync =async (app) => {
    app.get("/", home)
    app.get("/remove",remove)
}

