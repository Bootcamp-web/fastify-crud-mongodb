# fastify-partials-compra
1. [Arrancar npm](#schema1)
2. [Instalar los paquetes necesarios ](#schema2)
3. [Añadir el script para que compile Typescript y ejecutarlo ](#schema3)






1. [Añadir el script para que compile Typescript y ejecutarlo ](#schema4)
1. [Añadimos el server](#schema5)
1. [Creamos app ](#schema6)
1. [Creamos main_router ](#schema7)
1. [Creamos index.hbs y main.hbs ](#schema8)
1. [Creamos add.hbs  ](#schema9)
1. [Añadimos la funcionalidad `remove ingredient` ](#schema10)
1. [Utilizamos `#with`de hadnlebars](#schema11)
1. [Partials](#schema12)
1. [Utilizamos `#with`de hadnlebars](#schema11)
<hr>

<hr>

<a name="schema1"></a>

# 1 Arrancar npm
~~~bash
npm init -y
~~~

<hr>

<a name="schema2"></a>

# 2 Instalar los paquetes necesarios
~~~
npm install fastify pino pino-pretty nodemon fastify-static handlebars point-of-view fastify-formbody typescript ts-node-dev 
~~~

<hr>

<a name="schema3"></a>

# 3 Añadir el script para que compile Typescript y ejecutarlo
~~~js
 "scripts": {
    "start": "node src/app.js",
    "dev":"ts-node-dev src/server.js",
    "build": "tsc"
      },
~~~

~~~bash
yarn build tsc --init
~~~

<hr>

<a name="schema5"></a>

# 5 Añadimos el server
~~~js
import fastify from "fastify";


const server = fastify({
    logger:{
        prettyPrint:true
    },
    disableRequestLogging:false
})

const PORT= 3000;
server.listen(PORT)
~~~

<hr>

<a name="schema6"></a>

# 6 Creamos app
~~~ js
import {FastifyPluginAsync} from "fastify"
import path from "path"
import { main_router } from "../routers/main.router";

export const main_app: FastifyPluginAsync =async (app) => {
    app.register(require("fastify-static"),{
        root: path.join(__dirname, "../public"),
        prefix:"/staticFiles",
    });
    app.register(require("point-of-view"), 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
    });
    app.register(require("fastify-formbody"));
    app.register(main_router);
}
~~~
Para que esto funcione necesitamos instalar 
~~~
yarn add @types/node
~~~
Cambiamos el require por: `fastifyStatic`, `pointOfView` y `formBodyPlugin`
~~~js
import {FastifyPluginAsync} from "fastify"
import formBodyPlugin from "fastify-formbody";
import fastifyStatic from "fastify-static";
import path from "path"
import pointOfView from "point-of-view";
import { main_router } from "../routers/main.router";

export const main_app: FastifyPluginAsync =async (app) => {
    app.register(fastifyStatic,{
        root: path.join(__dirname, "../public"),
        prefix:"/staticFiles",
    });
    app.register(pointOfView, 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
    });
    app.register(formBodyPlugin);
    app.register(main_router);
}
~~~
Añadimos `app.register(list_router, { prefix: "/list" });`
para poder enroutar a list_router
~~~js
import {FastifyPluginAsync} from "fastify"
import formBodyPlugin from "fastify-formbody";
import fastifyStatic from "fastify-static";
import path from "path"
import pointOfView from "point-of-view";
import { main_router } from "../routers/main.router";
import { list_router } from "../routers/list.router";

export const main_app: FastifyPluginAsync =async (app) => {
    app.register(fastifyStatic,{
        root: path.join(__dirname, "../public"),
        prefix:"/staticFiles",
    });
    app.register(pointOfView, 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
    });
    app.register(formBodyPlugin);
    app.register(main_router);
    app.register(list_router, { prefix: "/list" });
}
~~~

<hr>

<a name="schema7"></a>

# 7 Creamos main_router
~~~js
import { FastifyPluginAsync } from "fastify"



const home = (request: any, reply: any) => {
    const data = { title: "Your Shopping list" };
    reply.view("views/index", data);
}
export const main_router:FastifyPluginAsync =async (app) => {
    app.get("/", home)
}
~~~
Añadimos `list`
~~~js
import { FastifyPluginAsync } from "fastify"
import {list} from "./list.router"


const home = (request: any, reply: any) => {
    const data = { title: "Your Shopping list", list };
    reply.view("views/index", data);
}
export const main_router:FastifyPluginAsync =async (app) => {
    app.get("/", home)
}

~~~

<hr>

<a name="schema8"></a>

# 8 Creamos index.hbs y main.hbs
- `index.hbs`
~~~html
<h1>{{title}}</h1>
~~~
Lo modificamos para poder coger los datos que nos entren al pulsar añadir
~~~html
<h1>{{title}}</h1>
<ul>
    {{#each list}}
    <li>Productos:{{this.ingrediente}}, Cantidad:{{this.cantidad}}</li>
    {{/each}}
</ul>

<a href="/list/add">Añadir</a>
~~~

- ` main.hbs`
~~~html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    {{{body}}}
</body>
</html>
~~~

<hr>

<a name="schema9"></a>

# 9 Creamos add.hbs 
~~~html
<h1>{{title}}</h1>

<form action = "/list/form" method="POST">
	<p>Ingrediente:</p>
	<input name="ingrediente" />
	<p>Cantidad</p>
	<input name="cantidad" />
	<p></p>
	<button type="submit">Añadir</button>
</form>
<a href="/">Back</a> 
~~~

<hr>

<a name="schema10"></a>

# 10 Añadimos la funcionalidad `remove ingredient`
- Modificamos `index.hbs`
Añadimos un enlace para que borre cierto elemento. Tenemos que crear un id para cada elemento de la lista
~~~html
<h1>{{title}}</h1>
<ul>
    {{#each list}}
    <li>Productos: {{ this.ingrediente }}. Cantidad: {{ this.cantidad }} 
        <a href="/remove?id={{this.id}}">Delete</a>
    </li>
    {{/each}}
</ul>

<a href="/list/add">Añadir</a>
~~~
- Modificamos `list_router`, para poner un `id` a cada elemento, con un contador
~~~js
import {FastifyPluginAsync} from "fastify"
import { request } from "http"

 
export let list= [
    {ingrediente:"Papas", cantidad:3,id:0 },
    {ingrediente:"Cebollas",cantidad:6,id:1},
    {ingrediente:"Huevos",cantidad:6,id:2},
]
let cont = 3;
const add = (request: any, reply:any)=>{
    const data ={title: "Add items to your shopping list"}
    
    reply.view("views/add",data)
}

const form = (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
   
    const newItem = { ingrediente, cantidad,id:cont }
    console.log(newItem)
    list.push(newItem)
    cont++
    reply.redirect("add");

}
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
}
~~~
- Añadimos método de borrado en `main_router`
~~~js
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
~~~

<hr>

<a name="schema11"></a>

# 11 Utilizamos `#with`de hadnlebars
- Modificamos el `index.hbs`
~~~html
<h1>{{title}}</h1>
<ul>
    {{#each list}}
        {{#with this}}
            <li>Productos: {{ ingrediente }}. Cantidad: {{ cantidad }} -  
            <a href="/remove?id={{id}}">Delete</a>
            </li>
        {{/with}}
   
    {{/each}}
</ul>

<a href="/list/add">Añadir</a>
{{#if list.length}} 
    <h2>Theres are {{list.length}} in the list</h2>
   <div>
       <h3>The most important is</h3>
        <li>Productos: {{ list.0.ingrediente }}. 
            Cantidad: {{ list.0.cantidad }}
            
        </li>
     
   </div>
{{/if}}
~~~

<hr>

<a name="schema12"></a>

# 12 Partials
Partials inserta código html de forma rápida y sin duplicar código.
- Añadimos algo de `boostrap` a `main.hbs`
~~~html
<!DOCTYPE html>
<html lang="en">
<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
			crossorigin="anonymous"
		/>
		<script
			src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js"
			integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB"
			crossorigin="anonymous"
		></script>
		<script
			src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js"
			integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13"
			crossorigin="anonymous"
		></script>
		<title>Document</title>
	</head>
<body>
    {{{body}}}
</body>
</html>
~~~
- Creamos el partial `ingrediente.hbs`
~~~html
<div class="card" style="margin: 10px">
	{{!-- <img src="/staticFiles/img/{{img}}" class="card-img-top" alt="..." /> --}}
	<div class="card-body">
		<h5 class="card-title">{{ingrediente}}</h5>
		<p class="card-text">Cantidad: {{cantidad}}</p>
		<a href="/remove?id={{id}}" class="btn btn-primary">Delete ingredient</a>
	</div>
</div>
~~~
- Modificamos  `app.ts` para añadirle los partialls
~~~js
export const main_app: FastifyPluginAsync =async (app) => {
    app.register(fastifyStatic,{
        root: path.join(__dirname, "../public"),
        prefix:"/staticFiles",
    });
    app.register(pointOfView, 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
        options:{
            partials:{
                ingrediente:'/views/partials/ingrediente.hbs'
            }
        }
    });
    app.register(formBodyPlugin);
    app.register(main_router);
    app.register(list_router, { prefix: "/list" });
}
~~~
- Camiamos el `index.hbs` para utilizar el partials de ingrediente
~~~html
<h1>{{title}}</h1>
<div class = 'row' style="margin-top:50px">
        {{#each list}}
            {{#with this}}
                <div class = "row-4">{{>ingredientes}}</div> 
            {{/with}}
        {{/each}}
    
</div>

<a href="/list/add">Añadir</a>

{{#if list.length}} 
    <h2>Theres are {{list.length}} in the list</h2>
   <div>
       <h3>The most important is</h3>
        <div class = "row-4">{{>ingredientes list.[0]}}</div>    
   </div>
{{/if}}
~~~

<hr>

<a name="schema13"></a>

# 13 Hacemos un menú con Partials
- Creamos el `menu.hbs`
~~~html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<div class="container-fluid">
		<a class="navbar-brand" href="#">Recetas made in Spain 🇪🇸</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link active" aria-current="page" href="#">Home</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="list/add">Añadir ingrediente</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="#">Borrar todos</a>
				</li>
			</ul>
		</div>
	</div>
</nav>
~~~
- Modificamos el archiv `main.hbs` le añadimos el partial `menu.hbs`
~~~html
<!DOCTYPE html>
<html lang="en">
<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
			crossorigin="anonymous"
		/>
		<script
			src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js"
			integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB"
			crossorigin="anonymous"
		></script>
		<script
			src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js"
			integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13"
			crossorigin="anonymous"
		></script>
		<title>Document</title>
	</head>
<body>
    <section class="container">
			{{>menu}}
			{{{body}}}
		</section>
    
</body>
</html>
~~~
- Añadimos el partial  menu en `app.ts`
~~~js
export const main_app: FastifyPluginAsync =async (app) => {
    app.register(fastifyStatic,{
        root: path.join(__dirname, "../public"),
        prefix:"/staticFiles",
    });
    app.register(pointOfView, 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
        options:{
            partials:{
                ingredientes:'/views/partials/ingrediente.hbs',
                menu:'views/partials/menu.hbs'
            }
        }
    });
    app.register(formBodyPlugin);
    app.register(main_router);
    app.register(list_router, { prefix: "/list" });
}
~~~

# 14 Creamos un partial para los formularios
- Creamos dentro de la carpeta `partials` una carpeta llamada `forms` y dentro de esta archivo `add_ingrediente.hbs`. Quitamos toda la parte de form del archivo `add.hbs`.
Quedando `add.hbs`
~~~html
<h1>{{title}}</h1>

<div>{{>add_ingredient}}</div>

~~~
Y `add_ingredients.hbs` así: 
~~~html
<form action = "/list/form" method="POST">
	<p>Ingrediente:</p>
	<input name="ingrediente" />
	<p>Cantidad</p>
	<input name="cantidad" />
	<p></p>
	<button type="submit">Añadir</button>
</form>
<a href="/">Back</a> 
~~~
- Modificamos el archivo ``app.ts` añadiendo el partial nuevo
~~~ts
export const main_app: FastifyPluginAsync =async (app) => {
    app.register(fastifyStatic,{
        root: path.join(__dirname, "../public"),
        prefix:"/staticFiles",
    });
    app.register(pointOfView, 
    {
        engine: {
            handlebars: require("handlebars"),
        },
        layout: "./views/layouts/main.hbs",
        options:{
            partials:{
                ingredientes:'/views/partials/ingrediente.hbs',
                menu:'views/partials/menu.hbs',
                add_ingrediente:'views/partials/forms/add_ingrediente.hbs'
            }
        }
    });
    app.register(formBodyPlugin);
    app.register(main_router);
    app.register(list_router, { prefix: "/list" });
~~~
- Añadimos `add_ingredient` también en el ìndex.hbs`
~~~html
<h1>{{title}}</h1>
<div class = 'row' style="margin-top:50px">
        {{#each list}}
            {{#with this}}
                <div class = "row-4">{{>ingredientes}}</div> 
            {{/with}}
        {{/each}}
    
</div>

<a href="/list/add">Añadir</a>

{{#if list.length}} 
    <h2>Theres are {{list.length}} in the list</h2>
   <div>
       <h3>The most important is</h3>
        <div class = "row-4">{{>ingredientes list.[0]}}</div>    
   </div>
   <h1>{{title}}</h1>
    <h2>Añadir ingrediente</h2>
    {{>add_ingredient}}
{{/if}}
~~~

- Cambiamos `list_router.ts` para que al añadir ingrediente nos lleve a la `home`
~~~js
import {FastifyPluginAsync} from "fastify"


 
export let list= [
    {ingrediente:"Papas", cantidad:3,id:0 },
    {ingrediente:"Cebollas",cantidad:6,id:1},
    {ingrediente:"Huevos",cantidad:6,id:2},
]
let cont = 3;
const add = (request: any, reply:any)=>{
    const data ={title: "Add items to your shopping list"}
    
    reply.view("views/add",data)
}

const form = (request: any, reply:any)=>{
    const { ingrediente, cantidad } = request.body;
   
    const newItem = { ingrediente, cantidad,id:cont }
    console.log(newItem)
    list.push(newItem)
    cont++
    reply.redirect("/");

}
export  const list_router: FastifyPluginAsync  = async(app)=>{
    app.post("/form",form)
    app.get("/add",add)
}
~~~# fastify-crud
