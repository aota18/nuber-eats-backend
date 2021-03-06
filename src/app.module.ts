import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';
import { TypeOrmModule }from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';
import { UsersModule } from './users/users.module';

import { User } from './users/entites/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entites/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurant/entities/restaurant.entity';
import { Category } from './restaurant/entities/category.entity';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Dish } from './restaurant/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV ===  'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'production', 'test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        S3_ACCESS_KEY_ID: Joi.string().required(),
        S3_SECRET_ACCESS_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, 
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'production',
      logging:  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'dev',
      entities: [
        User, 
        Verification, 
        Restaurant, 
        Category, 
        Dish, 
        Order, 
        OrderItem,
        Payment,
      ]

    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      context:({req, connection}) => {
        const TOKEN_KEY = 'x-jwt';
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY]
        }


     },
    }),
  UsersModule,
  ScheduleModule.forRoot(),
  JwtModule.forRoot({
    privateKey: process.env.PRIVATE_KEY
  }),
  AuthModule,
  MailModule.forRoot({
    apiKey: process.env.MAILGUN_API_KEY,
    fromEmail: process.env.MAILGUN_FROM_EMAIL,
    domain: process.env.MAILGUN_DOMAIN_NAME
  }),
  RestaurantModule,
  OrdersModule,
  CommonModule,
  PaymentsModule,
  UploadsModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
