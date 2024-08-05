import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDto, UpdateUserDTO } from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //   Get Profile
  @UseGuards(AuthGuard)
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
}
