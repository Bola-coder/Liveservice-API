import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
  }) {
    const userExists = await this.userService.getSingleUser({
      email: data.email,
    });
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await this.userService.hashPassword(data.password);
    data.password = hashedPassword;
    const user = await this.userService.createUser(data);
    console.log(user);
    const payload = { email: user.email, id: user.id };
    const token = await this.jwtService.signAsync(payload);
    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userService.getSingleUser({ email: data.email });

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
}
