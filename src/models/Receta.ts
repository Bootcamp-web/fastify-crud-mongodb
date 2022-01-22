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

