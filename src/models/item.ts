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

