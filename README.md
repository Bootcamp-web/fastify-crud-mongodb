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
mongodb-compass
~~~
~~~
mongodb://localhost:27017
~~~

# 5 Creamos el archivo `config.ts`
Donde configuramos las variables de entorno
~~~ts
import dotenv from "dotenv"

export  const PORT = process.env.PORT || 3000;
export  const DB_URL = process.env.DB_URL
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