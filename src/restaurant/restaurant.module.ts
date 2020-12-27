import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { DishResolver, RestaurantResolver } from './restaurant.resolver';
import { CategoryResolver} from './restaurant.resolver';
import { RestaurantService } from './restaurant.service';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])],
    providers: [RestaurantResolver, CategoryResolver, DishResolver, RestaurantService]
})
export class RestaurantModule {}
