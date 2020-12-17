
import { Args, Query, Resolver, Mutation} from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantService } from "./restaurant.service";
import { UpdateRestaurantDto } from "./dtos/update-restaurant-dto";


@Resolver(of => Restaurant)
export class RestaurantResolver {

    constructor(private readonly restauarntService: RestaurantService) {}
    /* For GraphQL*/
    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]>{
     
        return this.restauarntService.getAll();
    }
    @Mutation(returns => Boolean)
    async createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto ): Promise<boolean> {

            try{
                await this.restauarntService.createRestaurant(createRestaurantDto);
                return true;
            }catch(e){
                console.log(e);
                return false;
            }
            
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(@Args() UpdateRestaurantDto: UpdateRestaurantDto): Promise<boolean>{

        try {
            await this.restauarntService.updateRestaurant(UpdateRestaurantDto);
            return true;
        } catch(e){
            console.log(e);
            return false;
        }
    }

    /* Args() doesn't have to have name  : updateRestaruatnDto = Args
        Args() should have name: updateRestaurantDto = Inputtype */
    
}



