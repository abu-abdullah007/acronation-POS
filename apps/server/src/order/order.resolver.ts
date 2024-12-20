// src/order/order.resolver.ts
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql'
import { OrderService } from './order.service'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { Roles } from 'src/auth/roles.decorator'
import { UserRole } from '@prisma/client'
import { Order } from 'src/common/entities/order.entity'
import { CreateOrderInput } from './dto/create-order.input'
import { UpdateOrderInput } from './dto/update-order.input'
import { PaginationParams } from 'src/common/utils/pagination.utils'
import { EncryptResponse } from 'src/common/interfaces/config'

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Query(() => EncryptResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(
    UserRole.RESTAURANT_ADMIN,
    UserRole.MANAGER,
    UserRole.WAITER,
    UserRole.CHEF,
  )
  async getAllOrders(
    @Context() context: any,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<EncryptResponse> {
    const params: PaginationParams = { page, limit }
    return this.orderService.getAllOrders(context.req.user, params)
  }

  @Query(() => Order)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.WAITER, UserRole.CHEF)
  async getOrderById(
    @Args('orderId') orderId: string,
  ): Promise<EncryptResponse> {
    return this.orderService.getOrderById(orderId)
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.WAITER)
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @Context() context: any,
  ): Promise<EncryptResponse> {
    const user = context.req.user
    return this.orderService.createOrder(createOrderInput, user)
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.WAITER)
  async updateOrderStatus(
    @Args('orderId') orderId: string,
    @Args('updateOrderInput') updateOrderInput: UpdateOrderInput,
  ): Promise<EncryptResponse> {
    return this.orderService.updateOrderStatus(orderId, updateOrderInput.status)
  }
}
