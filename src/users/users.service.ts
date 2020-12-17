import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entites/user.entity";
import * as jwt from 'jsonwebtoken';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "src/restaurant/dtos/edit-profile.dto";
import { isObject } from "util";
import { Verification } from "./entites/verification.entity";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService
    ){ }


    async createAccount({email, password, role}: CreateAccountInput): Promise<{ok: boolean, error?: string}>{
        try{
            const exists = await this.users.findOne({email});

            if(exists){
                // make error
                return {ok: false, error: "There is a user with that email already"};
            }

            const user = await this.users.save(this.users.create({email, password, role}));
            await this.verifications.save(
                this.verifications.create({
                    user
                }),
            );
            return {ok: true};
        }catch(e){
            //make error
            return {ok: false, error: "Couldn't create account"};
        }
        // Check new user
        // create user & hash the password
        
    }

    async login ({email, password}: LoginInput) : Promise<{ok: boolean; error?: string; token?: string}>{

        // find the user with the email

        // check if the password is correct

        // make a JWT and give it to the user

        try{
            const user = await this.users.findOne({email}, {select: ['id', 'password']});
            if(!user){
                return {
                    ok: false,
                    error: "User not found"
                }
            }

            const passwordCorrect = await user.checkPassword(password);

            if(!passwordCorrect){
                return {
                    ok: false,
                    error: "Wrong password",
                }
            }

            const token = this.jwtService.sign({id: user.id});

            return {
                ok: true,
                token
            }

        }catch(error){
            return {
                ok: false,
                error
            }
        }
    }

    async findById(id:number) : Promise<User>{
        return this.users.findOne({id});
    }

    async editProfile(userId: number,{email, password}: EditProfileInput){
        const user = await this.users.findOne(userId);

        if(email){
            user.email = email;
        }

        if(password){
            user.password = password;
        }
        this.users.save(user);
    }

    async verifyEmail(code: string): Promise<boolean>{
       try{
        const verification = await this.verifications.findOne(
            {code},
            {loadRelationIds: true}
            );

        if(verification){
            verification.user.verified=true;
            this.users.save(verification.user);
            return true;
        }

        return false;
        }catch(e){
            console.log(e);
            return false;
        }
    }
}