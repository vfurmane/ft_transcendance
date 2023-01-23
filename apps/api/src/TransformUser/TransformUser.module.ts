import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformUserService } from './TransformUser.service';

@Module({
  providers: [TransformUserService],
  exports: [TypeOrmModule, TransformUserService],
})
export class TransformUserModule {}
