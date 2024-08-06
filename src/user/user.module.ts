import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, CloudinaryService],
  exports: [UserService],
})
export class UserModule {}
