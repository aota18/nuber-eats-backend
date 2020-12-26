import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Category } from "../entities/category.entity";


@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
    
    @Field(typs => [Category])
    results?: Category[]
}