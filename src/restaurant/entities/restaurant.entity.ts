import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type=> Number)
    id: number

    @Field(is => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type=> Boolean, {nullable: true, defaultValue: true})
    @Column({default: true})
    @IsBoolean()
    @IsOptional()
    isVegan?: boolean;

    @Field(type=> String, {defaultValue: 'California'})
    @Column()
    @IsString()
    address: string;

    @Field(type=> String)
    @Column()
    @IsString()
    ownerName: string;

    @Field(type=> String)
    @Column()
    @IsString()
    categoryName: string;
}