import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TransformUserModule } from '../TransformUser/TransformUser.module';

@Module({
  imports: [UsersModule, TransformUserModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
