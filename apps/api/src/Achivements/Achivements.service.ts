import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match, User, Achivements } from 'types';

@Injectable()
export class AchivementsService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Achivements)
    private readonly AchivementsRepository: Repository<Achivements>,
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

  saveAchivement(winner_id: string, looser_id: string){
    
  };

}
