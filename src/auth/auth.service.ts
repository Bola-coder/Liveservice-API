import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EmailService } from 'src/email/email.service';
import { decrypt, encrypt } from 'src/utils/encryption';
import { createToken } from 'src/utils/token';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(
    data: {
      email: string;
      password: string;
      firstname: string;
      lastname: string;
    },
    req: Request,
  ) {
    const userExists = await this.userService.getSingleUser({
      email: data.email,
    });
    if (userExists) {
      throw new NotFoundException('User already exists');
    }

    const hashedPassword = await this.userService.hashPassword(data.password);
    data.password = hashedPassword;

    const user = await this.userService.createUser(data);
    const payload = { email: user.email, id: user.id };
    const token = await this.jwtService.signAsync(payload);

    // Send welcome email
    this.emailService.sendMail({
      subject: 'Welcome to our LiveServices',
      to: user.email,
      template: 'welcome',
      context: {
        name: user.firstname + ' ' + user.lastname,
      },
    });

    // Send Email verification email
    const protocol = req.protocol;
    const host = req.get('host');
    const verification_token = createToken();
    const hashed_verification_token = await encrypt(verification_token);
    await this.userService.updateUser({
      where: { email: user.email },
      data: { verification_token: hashed_verification_token },
    });

    const verification_url = `${protocol}://${host}/auth/verify-email/${user.email}/${verification_token}`;
    console.log(verification_url);

    this.emailService.sendMail({
      subject: 'Verify your email',
      to: user.email,
      template: 'email_verification',
      context: {
        name: user.firstname + ' ' + user.lastname,
        verification_url,
      },
    });

    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userService.getSingleUser(
      { email: data.email },
      'password',
    );

    console.log(user);

    if (
      !user ||
      !(await this.userService.comparePassword(data.password, user?.password))
    ) {
      throw new NotFoundException('Invalid credentials');
    }

    const payload = { email: user.email, id: user.id };
    const token = await this.jwtService.signAsync(payload);
    return { user, token };
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.userService.getSingleUser(
      { email },
      'verification_token',
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verified) {
      return { message: 'User email has already been verified' };
    }

    const isTokenValid = await decrypt(token, user.verification_token);

    if (!isTokenValid) {
      throw new NotFoundException('Invalid token');
    }

    user.verified = true;
    user.verification_token = null;
    await this.userService.updateUser({ where: { email }, data: user });
    return { message: 'Email verified' };
  }

  async resendEmailVerificationLink(email: string, req: Request) {
    if (!email) {
      throw new NotFoundException('Email is required');
    }
    const user = await this.userService.getSingleUser(
      { email },
      'verification_token',
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verified) {
      return { message: 'User email has already been verified' };
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const verification_token = createToken();
    const hashed_verification_token = await encrypt(verification_token);
    await this.userService.updateUser({
      where: { email: user.email },
      data: { verification_token: hashed_verification_token },
    });

    const verification_url = `${protocol}://${host}/auth/verify-email/${user.email}/${verification_token}`;
    console.log(verification_url);

    this.emailService.sendMail({
      subject: 'Verify your email',
      to: user.email,
      template: 'email_verification',
      context: {
        name: user.firstname + ' ' + user.lastname,
        verification_url,
      },
    });

    return { message: 'Verification link sent' };
  }
}
