import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as unknown;

    if (!user) {
      return undefined;
    }
    return data ? (user as Record<string, unknown>)[data] : user;
  },
);
