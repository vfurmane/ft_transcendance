import {
    Body,
    Controller,
    Get,
    Param,
    UseGuards,
  } from '@nestjs/common';
import { Achievements, MatchFront } from 'types';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { isUUIDDto } from '../conversations/dtos/IsUUID.dto';
import { AchievementsService } from './Achievements.service';

@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
constructor(private readonly achievemtsService: AchievementsService) {}


@Get('/:id')
getAchievements(@Param() { id }: isUUIDDto): Promise<Achievements[]> {
    return this.achievemtsService.getAchivements(id);
}
}