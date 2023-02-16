import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, Achievements, Userfront, MatchFront } from 'types';

@Injectable()
export class AchievementsService {
  constructor(
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

    this.achivementsList.push(  {
      title: "YIIIHA !!",
      description: "You win your first play !",
      logo: "Yiiiha"
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

  async getAchivements(user_id : string)
  {
    const res =  await this.userRepository.findOne({
      relations: {
        achievements: true, 
      },
      where: {
        id: user_id,
      },
    });
    if (!res)
      throw new NotFoundException('user not found');
    return res.achievements;
  }

  async saveAchievement(winner : User, looser : User, winnerHistory: MatchFront[], looserHistory: MatchFront[]){
    
    const winnerAchievements = await this.getAchivements(winner.id);

    console.log("winner : ", winnerHistory);
    console.log("looser : ", looserHistory);
    console.log("winner achivement : ", winnerAchievements);

    if (winnerAchievements.length === 0)
    {
      const newAchievements = new Achievements();
      newAchievements.title = this.achivementsList[0].title;
      newAchievements.description = this.achivementsList[0].description;
      newAchievements.user = winner;
      newAchievements.logo = this.achivementsList[0].logo;
      await this.AchievementsRepository.save(newAchievements);
    }
  };

}
