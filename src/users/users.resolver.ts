
import { createParamDecorator, UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver, Query, Context} from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { Role } from "src/auth/role.decorator";
import { EditProfileInput, EditProfileOutput } from "src/users/dtos/edit-profile.dto";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { User } from "./entites/user.entity";
import { UsersService } from "./users.service";

@Resolver(of => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService
    ){}

    @Query(returns => User)
    @Role(['Any'])
    me(@AuthUser() authUser: User){
       return authUser;
    }
        
    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput:CreateAccountInput): Promise<CreateAccountOutput>{
            return this.usersService.createAccount(createAccountInput);
    }


    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput>{
            return this.usersService.login(loginInput);
    }


    @Role(['Any'])
    @Query(returns => UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput>{
        
        return this.usersService.findById(userProfileInput.userId);

    }

    @Role(['Any'])
    @Mutation(returns => EditProfileOutput)
    async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput: EditProfileInput) : Promise<EditProfileOutput>{

        return  this.usersService.editProfile(authUser.id, editProfileInput);
    }


    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput>{
    
        return this.usersService.verifyEmail(verifyEmailInput.code);
   
    }



   




}