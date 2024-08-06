import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // hashPassword method
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // comparePassword method
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Method to find a single user based on a unique field
  async getSingleUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ...includedPrivateFields: (keyof User)[]
  ): Promise<Partial<User> | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        password: includedPrivateFields.includes('password'),
        role: true,
        location: true,
        verification_token:
          includedPrivateFields.includes('verification_token'),
        verified: true,
        created_at: true,
        profile_image: true,
      },
    });
  }

  // Method to find all users
  async getAllUsers(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserWhereUniqueInput;
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
    },
    ...includedPrivateFields: (keyof User)[]
  ): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        password: includedPrivateFields.includes('password'),
        role: true,
        location: true,
        verification_token:
          includedPrivateFields.includes('verification_token'),
        verified: true,
        created_at: true,
        profile_image: true,
      },
    });
  }

  // Method to create a user
  async createUser(
    data: Prisma.UserCreateInput,
    ...includedPrivateFields: (keyof User)[]
  ): Promise<User> {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        password: includedPrivateFields.includes('password'),
        role: true,
        location: true,
        verification_token:
          includedPrivateFields.includes('verification_token'),
        verified: true,
        created_at: true,
        profile_image: true,
      },
    });
  }

  // Method to update a user
  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: Prisma.UserUpdateInput;
    },
    ...includedPrivateFields: (keyof User)[]
  ): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      where,
      data,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        password: includedPrivateFields.includes('password'),
        role: true,
        location: true,
        verification_token:
          includedPrivateFields.includes('verification_token'),
        verified: true,
        created_at: true,
        profile_image: true,
      },
    });
  }

  // Method to delete a user
  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }
}
