import  mongoose,{Schema, Document} from "mongoose"
import { Ingrediente } from "./Ingrediente";


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

export const getIngredientes = async (idReceta: string) => {
    const ingredientes = await Ingrediente.find({ receta: idReceta }).lean();
    return ingredientes
};

export const Receta = mongoose.model<Receta>("Receta", schema)

