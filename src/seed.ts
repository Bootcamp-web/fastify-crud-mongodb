import  mongoose,{Schema, Document} from "mongoose"
import { Ingrediente } from "./models/Ingrediente"
import { DB_URL } from "./config"
import { Receta } from "./models/Receta";

export type Item= {
    ingrediente: string;
    cantidad: number;
    img: string
}

export let list: Array<Item> = [
    { ingrediente: "Patatas", cantidad: 3, img: "ingredients.jpeg" },
    { ingrediente: "Cebollas", cantidad: 6,  img: "ingredients.jpeg" },
    { ingrediente: "Huevos", cantidad: 5, img: "ingredients.jpeg" },
];

(async()=>{
    await mongoose.connect(DB_URL).then(() => console.log(`Conected to ${DB_URL}`))

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

        const doc = await item.save()
        console.log(`Created ingrediente ${item.nombre} with id ${doc._id}`)
    }
    await mongoose.disconnect().then(()=>{
        console.log("bye")
    })


    
})();
