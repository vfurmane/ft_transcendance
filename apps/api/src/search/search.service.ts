import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from 'types';
import { TransformUserService, Userfront } from 'src/TransformUser/TransformUser.service';

@Injectable()
export class SearchService {
    constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly transformUserService : TransformUserService
    ) {}

    async findAll(letters : string): Promise<Userfront[]> {

        const queryBuilder = this.usersRepository?.createQueryBuilder().select('*');

        queryBuilder.where(
            `LOWER(SUBSTRING(name, 1, ${letters.length})) IN (:letters)`,
            {
                letters,
            },
        );

        const users =  await queryBuilder.getRawMany();
        let usersFront : Userfront[] = [];
        for (let i = 0; i < users.length; i++)
        {
            usersFront.push(await this.transformUserService.transform(users[i]));
        }

        return usersFront;
    }
}