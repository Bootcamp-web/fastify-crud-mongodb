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
