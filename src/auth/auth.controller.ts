import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { EmailService } from 'src/email/email.service';
import { encrypt } from 'src/utils/encryption';
import { createToken } from 'src/utils/token';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.register(createUserDto);

    // Send welcome email
    this.emailService.sendMail({
      subject: 'Welcome to our LiveServices',
      to: data.user.email,
      template: 'welcome',
      context: {
        name: data.user.firstname + ' ' + data.user.lastname,
      },
    });

    // Send Email verification email
    const protocol = req.protocol;
    const host = req.get('host');
    const verification_token = createToken();
    const hashed_verification_token = await encrypt(verification_token);
    data.user.verification_token = hashed_verification_token;

    const verification_url = `${protocol}://${host}/auth/verify-email/${data.user.email}/${verification_token}`;
    console.log(verification_url);

    this.emailService.sendMail({
      subject: 'Verify your email',
      to: data.user.email,
      template: 'email_verification',
      context: {
        name: data.user.firstname + ' ' + data.user.lastname,
        verification_url,
      },
    });

    res.cookie('token', data.token, { httpOnly: true });
    return {
      message: 'User has been created successfully',
      data: data.user,
    };
  }

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
}
