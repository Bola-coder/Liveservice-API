import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDto, UpdateUserDTO } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileImageValidationPipe } from 'src/validators/profile-image-validation.pipe';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('/api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private cloudinaryService: CloudinaryService,
  ) {}

  //   Get Profile
  @Get('profile')
  async getUserProfile(@Body() getUserDto: GetUserDto) {
    const user = await this.userService.getSingleUser({
      email: getUserDto.email,
    });

    if (!user) {
      return {
        message: 'User not found',
      };
    }
    return {
      message: 'User details retrieved successfully',
      data: user,
    };
  }

  //   Update User Profile
  @Patch('profile/:email')
  async updateUserProfile(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDTO,
  ) {
    try {
      if (Object.keys(updateUserDto).length === 0) {
        return {
          message: 'Please provide details to update',
        };
      }
      const user = await this.userService.updateUser({
        where: { email: email },
        data: updateUserDto,
      });

      if (!user) {
        return {
          message: 'User not found',
        };
      }

      return {
        message: 'User details updated successfully',
        data: user,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  @Patch('update-profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfilePicture(
    @Body() getUserDto: GetUserDto,
    @UploadedFile(ProfileImageValidationPipe) image: Express.Multer.File,
  ) {
    try {
      // Check if the user exists
      const user = await this.userService.getSingleUser({
        email: getUserDto.email,
      });

      if (!user) {
        throw new BadRequestException(
          'User with the email address does not exist',
        );
      }

      // Upload Image to cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(image);
      console.log(uploadResult);

      // Uodate user details with the link to the image uploaded
      if (uploadResult) {
        const updatedUser = await this.userService.updateUser({
          where: { email: getUserDto.email },
          data: {
            ...user,
            profile_image: uploadResult?.secure_url,
          },
        });
        return updatedUser;
      }
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        stack: error.stack,
      };
    }
  }
}
