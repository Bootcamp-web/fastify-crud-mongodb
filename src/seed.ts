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
