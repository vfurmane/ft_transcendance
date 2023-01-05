import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from '../users/user.entity';

@Injectable()
export class SearchService {
    constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    ) {}

    async findAll(letters : string): Promise<string[]> {

        const queryBuilder = this.usersRepository?.createQueryBuilder().select('*');

        queryBuilder.where(
            `LOWER(SUBSTRING(name, 1, ${letters.length})) IN (:letters)`,
            {
                letters,
            },
        ).select('name');
        return  await queryBuilder.getRawMany();
    }
}