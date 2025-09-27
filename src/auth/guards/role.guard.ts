import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private roles: string[]) {} // Pass roles when applying

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JwtStrategy
    if (!user || !user.role) return false;
    return this.roles.includes(user.role); // Check if user's role matches
  }
}