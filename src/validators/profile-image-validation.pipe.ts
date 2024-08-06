/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ProfileImageValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException('Please select an image to upload');
    }

    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedFileTypes.includes(file.mimetype)) {
      throw new BadRequestException('Selected image has an invalid file type');
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('The image selected should be 2mb or less');
    }

    return file;
  }
}
