import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RestaurantInput } from "src/restaurant/dtos/restaurant.dto";
import { Dish } from "src/restaurant/entities/dish.entity";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";
import { User, UserRole } from "src/users/entites/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>
    ){}

    async createOrder(customer: User, {restaurantId, items}: CreateOrderInput) : Promise<CreateOrderOutput> {

        try{
            const restaurant = await this.restaurants.findOne(restaurantId);
            
            if(!restaurant){
                return {
                    ok: false,
                    error: "Restaurant not found"
                }
            }

            let orderFinalPrice = 0;
            const orderItems: OrderItem[] = [];
            
            for(const item of items){
                const dish = await this.dishes.findOne(item.dishId);

                if(!dish){
                    return {
                        ok: false,
                        error: 'Dish not found'
                    }
                }

                let dishFinalPrice = dish.price;

                for(const itemOption of item.options){
                    const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name);

                    if(dishOption){
                        if(dishOption.extra){
                            dishFinalPrice+=dishOption.extra
                        }else {
                            const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice);

                            if(dishOptionChoice){
                                if(dishOptionChoice.extra) dishFinalPrice+=dishOptionChoice.extra
                            }
                        }

                    }

                }

                orderFinalPrice +=dishFinalPrice;
                const orderItem = await this.orderItems.save(this.orderItems.create({
                    dish,
                    options: item.options
                }))
                orderItems.push(orderItem)
            }
            
            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderFinalPrice
            }));

            return {
                ok: true
            }

        }catch(error){
            return {
                ok: false,
                error: " Could not create an order"
            }
        }
    }


    async getOrders(user: User, {status}: GetOrdersInput): Promise<GetOrdersOutput> {
        try{

            let orders: Order[]
            if(user.role === UserRole.Client){
                 orders = await this.orders.find({
                    where: {
                        customer: user,
                        ...(status && {status})
                    }
                })
            }else if (user.role === UserRole.Delivery){
                 orders = await this.orders.find({
                    where: {
                        customer: user,
                        ...(status && {status})
                    }
                })
            }else if(user.role === UserRole.Owner){
                 const restaurants = await this.restaurants.find({
                    where: {
                        owner: user,
                    },
                    relations: ['orders']
                });

                 orders = restaurants.map(restaurant => restaurant.orders).flat(1);

                 if(status){
                     orders = orders.filter(order => order.status === status);
                 }
                return {
                    ok: true,
                    orders
                }
            }

            return {
                ok: true
            }

        }catch{
            return {
                ok: false,
                error: 'Could not get orders'
            }
        }
    }


    async getOrder(user: User, {id: orderId}: GetOrderInput): Promise<GetOrderOutput> {
        try{
            const order = await this.orders.findOne(orderId, {relations: ['restaurant']});

            if(!order){
                return {
                    ok: false,
                    error: "Order not found"
                }
            }
          
            if (this.canSeeOrder(user, order)) {
              return {
                ok: false,
                error: 'You cant see that',
              };
            }
                
                return {
                    ok:true,
                    order
                }
        }catch{
            return {
                ok: false,
                error: 'Could not get order'
            }
        }
    }


    async editOrder(user: User, {id: orderId, status}: EditOrderInput): Promise<EditOrderOutput>{
        try {
            const order = await this.orders.findOne(orderId, {
                relations: ['restaurant']
            });

            
            if(!order) {
                return {
                    ok: false,
                    error: 'Order not found'
                }
            }

            if(!this.canSeeOrder(user, order)){
                return {
                    ok: false,
                    error: "You can't edit order"
                }
            }

        }catch {
            return {
                ok: false,
                error: 'Could not edit order'
            }
        }
    }

    canSeeOrder(user: User, order: Order):boolean {
        let canSee = true;
        if (user.role === UserRole.Client && order.customerId !== user.id) {
          canSee = false;
        }
        if (user.role === UserRole.Delivery && order.driverId !== user.id) {
          canSee = false;
        }
        if (
          user.role === UserRole.Owner &&
          order.restaurant.ownerId !== user.id
        ) {
          canSee = false;
        }

        return canSee;
    }
}