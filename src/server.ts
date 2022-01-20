import fastify from "fastify";
import {main_app} from "./app"

const server = fastify({
    logger:{
        prettyPrint:true
    },
    disableRequestLogging:false
})


server.register(main_app)
const PORT= 3000;
server.listen(PORT)