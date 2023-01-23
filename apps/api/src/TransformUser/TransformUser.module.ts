import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TransformUserService } from './TransformUser.service';
import { User } from 'types';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [TransformUserService],
  exports: [TransformUserService],
})
export class TransformUserModule {}
