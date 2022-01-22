# fastify-crud-mongodb
1. [Arrancar npm](#schema1)
2. [Instalar los paquetes necesarios ](#schema2)









<hr>

<a name="schema1"></a>

# 1 Arrancar npm y ejecutar build
~~~bash
npm init -y
~~~
~~~bash
npm run build -- --init
~~~

<hr>

<a name="schema2"></a>

# 2 Instalar los paquetes necesarios
Parte del código viene del `fastify-crud`
~~~
npm install 
~~~
# 3 Instalar dotenv y mongoose
dotenv: variables de entorno
mongoose: controlar mongodb
~~~bash
npm i dotenv mongoose
~~~



<a name="schema4"></a>
<hr>

# 4 Arrancamos mongo compas y conectar  a mongo
~~~
sudo systemctl start mongod
~~~
~~~
sudo systemctl status mongod
~~~
~~~
mongodb-compass
~~~
~~~
mongodb://localhost:27017
~~~

# 5 Creamos el archivo `config.ts`
Donde configuramos las variables de entorno
~~~ts
import dotenv from "dotenv"


const checkEnv = (envVar: string) => {
    if (!process.env[envVar]) {
        throw new Error(`Please define the Enviroment variable ${envVar}`);
    } else {
        return process.env[envVar] as string;
    }
};


export const PORT: number = parseInt(checkEnv("PORT"));
export const DB_URL: string = checkEnv("DB_URL");

~~~

# 6 Creamos el archivo `items.ts`
Creamos el archivo `config.ts` dentro de la carpeta models, donde vamos a crear nuestros modelos/plantilla que van a tener que respetar todos los elementos que vayamos a meter dentro de la base de datos.
~~~ts
import  mongoose,{Schema, Document} from "mongoose"


export interface Item extends Document{
    nombre:String;
    cantidad:Number;
    img:String;
}
const schema = new Schema(
    {
        nombre:String,
        cantidad:{type:Number,required:true},
        img:String
    },{
        timestamps:true
});

export const Item = mongoose.model<Item>("Item", schema)



~~~
Al poner `required:true` este campo es obligatorio
~~~ts
cantidad:{type:Number,required:true},
~~~
Con el `timestamps:true` va añadir un campo adicional a nuestros datos dentro de la bbdd, un campo de fecha
~~~ts
{
        timestamps:true
    })
~~~


# 7 Creamos el archivo `seed.ts`
~~~ts
import  mongoose,{Schema, Document} from "mongoose"
import { Item } from "./models/item"
import { DB_URL } from "./config"

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

(async()=>{
    await mongoose.connect(DB_URL).then(() => console.log(`Conected to ${DB_URL}`))

    try{
        await Item.collection.drop();
    }catch(error){
        console.log("There are no items to drop from db")
    }
   
    for(let i = 0; i<list.length; i++){
        const item = new Item ({
            nombre:list[i].ingrediente,
            cantidad:list[i].cantidad,
            img:list[i].img,
        })

        const doc = await item.save()
        console.log(`Created item ${item.nombre} with id ${doc._id}`)
    }
    await mongoose.disconnect().then(()=>{
        console.log("bye")
    })


    
})();

~~~

# 8 Cambiamos los archivos para poder surtirnos de la bbdd y no del local
- Añadimos a `app.ts`
~~~ts
await  mongoose.connect(DB_URL).then(()=>{
      console.log(`Connected to ${DB_URL}`)
  })
~~~
- Añadimos `server.ts`
~~~ts
import { PORT } from "./config";
server.listen(PORT)
~~~
- `main_routers.ts`
~~~ts
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
~~~
- Cambiamos `ingredient.ts`
~~~html
<h5 class="card-title">{{nombre}}</h5>
~~~
~~~html
<a href="/remove?id={{_id}}" class="btn btn-primary">Delete ingredient</a>
~~~
