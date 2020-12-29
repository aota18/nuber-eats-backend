import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { number } from "joi";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Payment } from "../entities/payment.entity";

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
    'transactionId',
    'restaurantId'

]){}


@ObjectType()
export class CreatePaymentOutput extends CoreOutput{}