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

