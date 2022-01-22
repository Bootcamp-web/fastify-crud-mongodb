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
- `main.routers.ts`
~~~ts
import { FastifyPluginAsync,  FastifyRequest, FastifyReply  } from "fastify"
import { Item } from "../models/item"

import {list} from "./list.router"

type Myrequest = FastifyRequest<{
    Querystring: { id: string }
}>
const remove = async(request: Myrequest, reply: FastifyReply) => {
    const { id } = request.query
    console.log(`Deleted item ${id}..`)
    await Item.findByIdAndDelete(id)
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
- `list.router.ts`
~~~ts
import {FastifyPluginAsync, FastifyRequest, FastifyReply} from "fastify"
import { Item } from "../models/item";


const add = (request: FastifyRequest, reply:FastifyReply)=>{
    const data ={title: "Add items to your shopping list"}
    
    reply.view("views/add",data)
}

const form = async (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
    const item = new Item({
        nombre:ingrediente,
        cantidad:cantidad,
        img:"ingrediente.jpg",

    })
    const doc = await item.save()
    console.log(`Created item ${item.nombre} with id ${doc._id}`)
    reply.redirect("/");

}
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
}
~~~


# 9 Añadimos ruta para borrar todos los elementos 
- `menu.hbs`
~~~html
	<li class="nav-item">
		<a class="nav-link" href="list/deleteall">Borrar todos</a>
    </li>
~~~
- Creamos la función `deleteall`en `list.router.ts`
~~~ts
const deleteall = async (request: MyRequest, reply:FastifyReply)=>{
    await Item.deleteMany();
    reply.redirect("/")
}

export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
    app.get("/deleteall",deleteall)
}
~~~

~~~html
 {{else}}
   <img src="https://media0.giphy.com/media/l4EoMN9qjAOaaAcNO/200.webp?cid=ecf05e4792c60qrrbtrug3fcpokrb83bhjrf6p2jx0gw5e7h&rid=200.webp&ct=g" alt="Inactive">
~~~

# 10 Recetario
- 1º  Creamos el modelo `Ingrediente.ts`
~~~ts
import  mongoose,{Schema, Document} from "mongoose"
import { Receta } from "./Receta";


export interface Ingrediente extends Document{
    nombre:String;
    cantidad:String;
    img:String;
    receta:Receta["_id"];
}
const schema = new Schema(
    {
        nombre:String,
        cantidad:{type:String,required:true},
        img:String,
        receta: { type: Schema.Types.ObjectId, ref: "Receta" },
    },{
        timestamps:true
});

export const Ingrediente = mongoose.model<Ingrediente>("Ingrediente", schema)

~~~
Con `receta: { type: Schema.Types.ObjectId, ref: "Receta" },` lo que estamos haciendo es hacer la relación entre los ingredientes y las recetas.

- 2º Creamos el modelo `Receta.ts` que va a contener los ingredientes y las instrucciones de la receta.
Vamos a crear un relación entre dos bases de datos, con las `_id`
~~~ts
import  mongoose,{Schema, Document} from "mongoose"


export interface Receta extends Document{
    nombre:String;
    instrucciones:String;
    ubicacion:{
        type:"Point",
        coordenadas: [Number,Number]
    }
}
const schema = new Schema(
    {
        nombre:String,
        instrucciones:String,
        ubicacion:{
            type:Object
        }
    },{
        timestamps:true
});

export const Receta = mongoose.model<Receta>("Receta", schema)
~~~
- 3º Modificamos el `seed.ts`
~~~ts
 try{
        await Ingrediente.collection.drop();
        await Receta.collection.drop();
    }catch(error){
        console.log("There are no items to drop from db")
    }
   
    const idReceta =  await Receta.create({
        nombre:"Tortilla de papas con cebolla",
        instrucciones:"Cortar, freir"
    })

    for(let i = 0; i<list.length; i++){
        const item = new Ingrediente ({
            nombre:list[i].ingrediente,
            cantidad:list[i].cantidad,
            img:list[i].img,
            receta: idReceta.id
        })
~~~

- 4º Añadimos la vista `receta.hbs`
~~~html
<div class="card" style="margin: 10px">
	<img src="/staticFiles/img/{{img}}" class="card-img-top" alt="..." />
	<div class="card-body">
		<h5 class="card-title">{{nombre}}</h5>
		<p class="card-text">Instrucciones: {{instrucciones}}</p>
		<a href="/remove?id={{_id}}" class="btn btn-primary">Delete recepie</a>
	</div>
</div>

~~~

- 5º Añadimos a `app.ts`
~~~ts
  receta:'/views/partials/receta.hbs',
~~~

- 6º Modificamos `index.hbs`
~~~html
<h1>{{title}}</h1>
<div class = 'row' style="margin-top:50px">
        {{#each list}}
            {{#with this}}
                <div class = "col-4">{{>receta}}</div> 
            {{/with}}
        {{/each}}
    
</div>


{{#if list.length}} 
    <h2>Theres are {{list.length}}  recepies in the list</h2>
  
   {{else}}
   {{!-- <img src="https://media0.giphy.com/media/l4EoMN9qjAOaaAcNO/200.webp?cid=ecf05e4792c60qrrbtrug3fcpokrb83bhjrf6p2jx0gw5e7h&rid=200.webp&ct=g" alt="Inactive">

   <h1>{{title}}</h1>
    <h2>Add ingredient</h2>
    {{>add_ingredient}} --}}
{{/if}}
~~~