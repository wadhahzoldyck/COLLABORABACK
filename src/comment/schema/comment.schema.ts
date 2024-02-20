import { Prop, Schema } from "@nestjs/mongoose";

@Schema({
    timestamps : true,
})
export class Comment{

    @Prop()
    title: string 
    


}