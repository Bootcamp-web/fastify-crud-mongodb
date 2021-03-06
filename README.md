# fastify-crud-mongodb
1. [Arrancar npm](#schema1)
2. [Instalar los paquetes necesarios ](#schema2)
1. [Instalar dotenv y mongoose](#schema3)
1. [Arrancamos mongo compas y conectar  a mongo](#schema4)
1. [Creamos el archivo `config.ts`](#schema5)
1. [Creamos el archivo `items.ts`](#schema6)
1. [ Creamos el archivo `seed.ts`](#schema7)
1. [Cambiamos los archivos para poder surtirnos de la bbdd y no del local](#schema8)
1. [Añadimos ruta para borrar todos los elementos ](#schema9)
1. [Recetario](#schema10)
1. [Recetario v2](#schema11)
1. [Borrar todas las recetas Recetas](#schema12)
1. [Añadir  recetas](#schema13)


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
<hr>

<a name="schema3"></a>

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

<a name="schema5"></a>
<hr>

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

<a name="schema6"></a>
<hr>


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
<a name="schema7"></a>
<hr>


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


<a name="schema8"></a>
<hr>


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

<a name="schema9"></a>
<hr>

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

<a name="schema10"></a>
<hr>


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
- 7º Función para poder traernos los ingredientes de la receta, modificamos `Receta.ts`
~~~ts 
export const getIngredientes = async (idReceta: string) => {
    const ingredientes = await Ingrediente.find({ receta: idReceta }).lean();
    return ingredientes
};
~~~

- 8º Modificamos `main.routes.ts`
~~~ts
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
    const data = { title: "Your Recipe list", receta_con_ingredientes };
    reply.view("views/index", data);
}
~~~
-9º Modificamos `index.hbs`

~~~html
<h1>{{title}}</h1>
<div class = 'row' style="margin-top:50px">
        {{#each recetas}}
            {{#with this}}
                <div class = "col-4">{{>receta}}</div> 
            {{/with}}
        {{/each}}
    
</div>


{{#if recetas.length}} 
    <h2>Theres are {{recetas.length}}  recepies in the list</h2>
  
   {{else}}
    <img src="https://media0.giphy.com/media/l4EoMN9qjAOaaAcNO/200.webp?cid=ecf05e4792c60qrrbtrug3fcpokrb83bhjrf6p2jx0gw5e7h&rid=200.webp&ct=g" alt="Inactive">
{{/if}}
~~~

<a name="schema11"></a>
<hr>


# 11 Recetario v2
- Modificamos el archivo `seed.ts`
~~~ts
import  mongoose,{Schema, Document} from "mongoose"
import { Ingrediente } from "./models/Ingrediente"
import { DB_URL } from "./config"
import { Receta } from "./models/Receta";

const crearTortilla = async (version:string, ubicacion:[Number,Number])=>{
    const receta = await Receta.create({
        nombre:`Tortilla de papas con cebolla -${version}`, 
        instrucciones:"Cortar, freir",
        ubicacion:{
            type:"Point",
            coordenates: ubicacion
        }
    })
 
    await Ingrediente.create({
        nombre:"Patatas",
        cantidad: "1kg",
        receta:receta._id,
        img:"ingredients.jpeg"
    });
     await Ingrediente.create({
         nombre:"Huevos",
         cantidad: "6",
         receta:receta._id,
         img:"ingredients.jpeg"
     });
     await Ingrediente.create({
         nombre:"Cebollas",
         cantidad: "2",
         receta:receta._id,
         img:"ingredients.jpeg"
     });
}


(async()=>{
    await mongoose.connect(DB_URL).then(() => console.log(`Conected to ${DB_URL}`))

    try{
        await Ingrediente.collection.drop();
        await Receta.collection.drop();
    }catch(error){
        console.log("There are no items to drop from db")
    }
 
    
    await crearTortilla("Madrid", [-3.70275, 40.41831]);
    await crearTortilla("Valencia", [-0.37739, 39.46975]);

    await mongoose.disconnect().then(()=>{
        console.log("bye")
    })


    
})();

~~~
- Modificamos el archivo `add_ingredient.hbs` para añadir ingredientes a la receta.
El la línea `<form action = "/list/form_ingredient?receta_id={{_id}}" method="POST">` le pasamos al ingrediente el id de la receta al que está asociado.
~~~html
<form action = "/list/form?receta_id={{_id}}" method="POST">
	<p>Ingrediente:</p>
	<input name="nombre" />
	<p>Cantidad</p>
	<input name="cantidad" />
	<p></p>
	<button type="submit">ADD</button>
</form>
<a href="/">Back</a> 
~~~

- Modificamos `list.router.ts`
~~~ts
import {FastifyPluginAsync, FastifyRequest, FastifyReply} from "fastify"

import { Ingrediente} from "../models/Ingrediente";

export type Ingredient = {
    ingrediente: string;
    cantidad: number;
    id: number;
    img: string
}
type MyRequest = FastifyRequest<{
    Body:{nombre:string,cantidad:string};
    Querystring:{receta_id:string}
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
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
    app.get("/deleteall",deleteall)
}
~~~
<a name="schema12"></a>
<hr>

# 12 Borrar todas las recetas Recetas
- Modificamos `list.router.ts`
~~~ts
const deleteall = async (request: MyRequest, reply:FastifyReply)=>{
    await Receta.deleteMany();
    reply.redirect("/")
}
~~~
Borra todas las recetas.

<a name="schema13"></a>
<hr>

# 13 Añadir  recetas
- Creamos un `form` para añadir las recetas.
~~~html
<form action = "/list/form_recipe" method="POST">
	<p>Recipe's name:</p>
	<input name="recipe_name" />
	<p>Instructios:</p>
	<input name="recipe_instructions" />
	<p></p>
	<button type="submit">ADD</button>
</form>
<a href="/">Back</a> 
~~~

- Modificamos `add.hbs`
~~~html
<h1>{{title}}</h1>

<div>{{>add_recipe}}</div>
~~~
- Modificamos `app.ts`
Para añadirle el nuevo partials
~~~ts
 app.register(pointOfView, 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
        options:{
            partials:{
                ingrediente:'/views/partials/ingrediente.hbs',
                receta:'/views/partials/receta.hbs',
                menu:'views/partials/menu.hbs',
                add_ingredient:'views/partials/forms/add_ingredient.hbs',
                add_recipe:'views/partials/forms/add_recipe.hbs'
            }
        }
    });
~~~

- Modificamos `list.router.ts`
Porque tenemos dos formularios.
~~~ts
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

~~~