# Nuber Eats

The Backend of Nuber Eats Clone



## User Model:

- id
- createdAt
- updatedAt

- email
- password
- role(client | owner | delivery)


## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email



## Restaruant Model

- name
- category
- address
- cover image


- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant

- Edit Restaurant
- Delete Restaurant


## Dish Model

- Create Dish
- Edit Dish
- Delete Dish


## Order Model

- Orders CRUD
- Orders Subscription (Owner, Customer, Delivery)
    - Pending Orders (Owner) (s: newOrder) (t: createOrder(newOrder))
    - Order Status (Customer) (s: orderUpdate) (t: editOrder (orderUpdate))
    - Pending Pickup Order (Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))
- Peyments (CRON)