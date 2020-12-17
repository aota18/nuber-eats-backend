import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entites/user.entity";
import * as jwt from 'jsonwebtoken';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "src/restaurant/dtos/edit-profile.dto";
import { isObject } from "util";
import { Verification } from "./entites/verification.entity";
import { MailService } from "src/mail/mail.service";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ){ }


    async createAccount({email, password, role}: CreateAccountInput): Promise<{ok: boolean, error?: string}>{
        try{
            const exists = await this.users.findOne({email});

            if(exists){
                // make error
                return {ok: false, error: "There is a user with that email already"};
            }

            const user = await this.users.save(this.users.create({email, password, role}));
            const verification = await this.verifications.save(
                this.verifications.create({
                    user
                }),
            );
            this.mailService.sendVerificationEmail(user.email, verification.code);
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
                error: "Can't log user in"
            }
        }
    }

    async findById(id:number) : Promise<UserProfileOutput>{
        try{
            const user = await this.users.findOneOrFail({id});
            return {
                ok: true,
                user,
            };
        } catch(error){
            return {ok: false, error: 'User not found'}
        }
    }

    async editProfile(userId: number,{email, password}: EditProfileInput): Promise<EditProfileOutput>{
        try{
            const user = await this.users.findOne(userId);

            if(email){
                user.email = email;
                user.verified = false;
                const verification = await this.verifications.save(this.verifications.create({user}));
                this.mailService.sendVerificationEmail(user.email, verification.code);
            }

            if(password){
                user.password = password;
            }
            await this.users.save(user);

            return {
                ok: true,
            };


        } catch(error){
            return {ok: false, error: 'Could not update profile'}
        }
        
        
    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput>{
       try{
        const verification = await this.verifications.findOne(
            {code},
            {loadRelationIds: true}
            );

        if(verification){
            verification.user.verified=true;
            await this.users.save(verification.user);
            await this.verifications.delete(verification.id);
            return {ok: true}
        }

        return {ok: false, error: 'Verification not found'};
        }catch(e){
        
            return {ok: false, error: 'Could not verify email'};
        }
    }
}