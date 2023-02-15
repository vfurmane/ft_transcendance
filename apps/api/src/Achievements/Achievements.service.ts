import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match, User, Achievements } from 'types';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Achievements)
    private readonly AchievementsRepository: Repository<Achievements>,
  ) 
  {
    this.initAchivementsList();
  }

  private readonly achivementsList : {title: string, description: string, logo: string}[]= [];

  initAchivementsList(){
    this.achivementsList.push(  {
        title: "Hello World",
        description: "You made your first play !",
        logo: "HelloWorld"
    });

    const titles = ['caporal', 'sergent', 'major', 'lieutenant', 'general']
    for (let i = 0; i < 5; i++)
    {
        this.achivementsList.push({
            title: titles[i],
            description: `you have won ${(i + 1) * 2} games in a row`,
            logo: `win${(i + 1) * 2}`
        });
    }
  };

  saveAchievement(winner_id: string, looser_id: string){
    
  };

}
