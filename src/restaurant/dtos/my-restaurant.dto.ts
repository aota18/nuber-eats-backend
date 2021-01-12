import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";




@ObjectType()
export class MyRestaurantOutput extends CoreOutput {
    @Field(type => Restaurant, {nullable: true})
    restaurant?: Restaurant
}

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']){
   
}