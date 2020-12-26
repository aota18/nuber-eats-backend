import { Field, InputType, ObjectType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { InputTypeFactory } from "@nestjs/graphql/dist/schema-builder/factories/input-type.factory";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";
import { CreateRestaurantInput } from "./create-restaurant.dto";


@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput){

    @Field(type => Number)
    restaurantId: number;
    
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}