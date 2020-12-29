import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { number } from "joi";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Payment } from "../entities/payment.entity";


@ObjectType()
export class GetPaymentsOutput extends CoreOutput{
    
    @Field(type => [Payment], {nullable: true})
    payments? : Payment[]
}