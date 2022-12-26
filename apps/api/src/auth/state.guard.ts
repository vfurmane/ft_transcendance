import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './state.entity';

@Injectable()
export class StateGuard implements CanActivate {
  constructor(
    @InjectRepository(State)
    private readonly statesRepository: Repository<State>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const stateToken = request.query.state;
    if (!stateToken) throw 'State parameter is needed.';

    const state = await this.statesRepository.findOneBy({
      token: stateToken,
    });
    if (state === null) {
      const state = new State();
      state.token = stateToken;
      await this.statesRepository.save(state);
    }
    request.state = state;
    return true;
  }
}
