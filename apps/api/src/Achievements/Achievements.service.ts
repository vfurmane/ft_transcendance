import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, Achievements, Userfront, MatchFront, Achivement } from 'types';


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

  private readonly achivementsList : {title: string, description: string, logo: number}[]= [];

  initAchivementsList(){
    this.achivementsList.push(  {
        title: "Hello World",
        description: "You win your first play !",
        logo: 0
    });

    const titles = ['caporal', 'sergent', 'major', 'lieutenant', 'general']
    for (let i = 1; i < 6; i++)
    {
        this.achivementsList.push({
            title: titles[i - 1],
            description: `you have won ${i * 2} games in a row`,
            logo: i
        });
    }

    this.achivementsList.push({
      title: "the force awakens",
      description: "You win after 3 defeat !",
      logo: 6
    });

    this.achivementsList.push({
      title: "Needs some Training !",
      description: "You loose 3 games in a row",
      logo: 7
    });

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


  async helloAchievements(winner : {user: User, history: MatchFront[], achievements: Achievements[]}){
    if (winner.history.length === 1)
    {
      console.log(winner.history);
      const newAchievements = new Achievements();
      newAchievements.title = this.achivementsList[0].title;
      newAchievements.description = this.achivementsList[0].description;
      newAchievements.user = winner.user;
      newAchievements.logo = this.achivementsList[0].logo;
      if (winner.achievements.findIndex(e => e.title === this.achivementsList[0].title) === -1)
        await this.AchievementsRepository.save(newAchievements);
    }
  }

  async gradeAchievements(winner : {user: User, history: MatchFront[], achievements: Achievements[]}){
    let num_of_victory = 0;
    let last = winner.history.length - 1;
    while (last >=0 && !winner.history[last].winner)
    {
      num_of_victory++;
      last--;
    }

    if (num_of_victory % 2 == 0 && num_of_victory <= 10)
    {
      const newAchievements = new Achievements();
      newAchievements.title = this.achivementsList[num_of_victory / 2].title;
      newAchievements.description = this.achivementsList[num_of_victory / 2].description;
      newAchievements.user = winner.user;
      newAchievements.logo = this.achivementsList[num_of_victory / 2].logo;

      if (winner.achievements.findIndex(e => e.title === this.achivementsList[num_of_victory / 2].title) === -1)
        await this.AchievementsRepository.save(newAchievements);
    }
  }

  async forceAwaken(winner : {user: User, history: MatchFront[], achievements: Achievements[]}){
    let num_of_defeat = 0;
    let beforelast = winner.history.length - 2;
    if (beforelast < 0) return;
    console.log('bbbeeeefffooorrreee : ', beforelast);
    while (beforelast >= 0 && !winner.history[beforelast].looser)
    {
      num_of_defeat++;
      beforelast--;
    }

    if (num_of_defeat > 3)
    {
      const newAchievements = new Achievements();
      newAchievements.title = this.achivementsList[6].title;
      newAchievements.description = this.achivementsList[6].description;
      newAchievements.user = winner.user;
      newAchievements.logo = this.achivementsList[6].logo;

      if (winner.achievements.findIndex(e => e.title === this.achivementsList[6].title) === -1)
      {
        await this.AchievementsRepository.save(newAchievements);
      }
    }
  }

  async needTraining(looser : {user: User, history: MatchFront[], achievements: Achievements[]}){
    let num_of_defeat = 0;
    let last = looser.history.length - 1;
    while (last >= 0 && !looser.history[last].looser)
    {
      num_of_defeat++;
      last--;
    }

    if (num_of_defeat > 3)
    {
      const newAchievements = new Achievements();
      newAchievements.title = this.achivementsList[7].title;
      newAchievements.description = this.achivementsList[7].description;
      newAchievements.user = looser.user;
      newAchievements.logo = this.achivementsList[7].logo;

      if (looser.achievements.findIndex(e => e.title === this.achivementsList[7].title) === -1)
        await this.AchievementsRepository.save(newAchievements);
    }
  }

  async saveAchievement(winner : User, looser : User, winnerHistory: MatchFront[], looserHistory: MatchFront[]){
    
    const winnerAchievements = await this.getAchivements(winner.id);
    const looserAchievements = await this.getAchivements(looser.id);
    
    this.helloAchievements({ user: winner, history : winnerHistory, achievements: winnerAchievements});
    this.gradeAchievements({ user: winner, history : winnerHistory, achievements: winnerAchievements});
    this.forceAwaken({ user: winner, history : winnerHistory, achievements: winnerAchievements});
    this.needTraining({ user: looser, history : looserHistory, achievements: looserAchievements});
  };

}
