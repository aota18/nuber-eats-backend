import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entites/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { Verification } from './entites/verification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers: [UsersResolver, UsersService],
    exports:[UsersService]
})
export class UsersModule {}
