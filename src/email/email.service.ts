import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  sendMail(mailOptions: {
    subject: string;
    to: string;
    template: string;
    context: object;
  }) {
    this.mailService.sendMail({
      from: `Bolarinwa Ahmed <${process.env.EMAIL_USER}>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      template: mailOptions.template,
      context: mailOptions.context,
    });
  }
}
