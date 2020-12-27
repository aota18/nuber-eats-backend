import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entites/core.entity";
import { Dish, DishChoice} from "src/restaurant/entities/dish.entity";
import { Column, Entity, ManyToOne } from "typeorm";


@InputType('OrderItemOptionInputType', {isAbstract: true})
@ObjectType()
export class OrderItemOption {
    @Field(type => String)
    name: string;
    @Field(type => String, {nullable: true})
    choice?: String

}

@InputType('OrderInputType', {isAbstract: true})
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {

    @ManyToOne(type => Dish, {nullable: true, onDelete: 'CASCADE'})
    dish: Dish;

    @Field(type => [OrderItemOption], {nullable: true})
    @Column({type: 'json', nullable: true})
    options?: OrderItemOption[]


}