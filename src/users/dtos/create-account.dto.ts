import {Field, InputType, ObjectType, OmitType, PickType} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entites/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
    "email", 
    "password",
    "role"
] ){

} 


@ObjectType()
export class CreateAccountOutput extends CoreOutput {
   
}