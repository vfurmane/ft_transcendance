import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { SearchController } from './search.controller'
import { SearchService } from './search.service';
import { TransformUserService } from 'src/TransformUser/TransformUser.service';

@Module({
  imports: [UsersModule],
  controllers: [SearchController],
  providers: [SearchService, TransformUserService],
})
export class SearchModule {}