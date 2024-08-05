import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  Param,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { SkipAuth } from './../skip-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.register(createUserDto, req);

    res.cookie('token', data.token, { httpOnly: true });
    return {
      message: 'User has been created successfully',
      data: data.user,
    };
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.login(loginDto);
    res.cookie('token', response.token, { httpOnly: true });
    return {
      message: 'User has been logged in successfully',
      data: response.user,
    };
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Get('verify-email/:email/:token')
  async verifyEmail(
    @Param('email') email: string,
    @Param('token') token: string,
  ) {
    const response = await this.authService.verifyEmail(email, token);
    return response;
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification-email')
  async resendVerificationEmail(
    @Req() req: Request,
    @Body('email') email: string,
  ) {
    const response = await this.authService.resendEmailVerificationLink(
      email,
      req,
    );
    return response;
  }
}
