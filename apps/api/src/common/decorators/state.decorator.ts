import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const State = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.state;
  },
);
