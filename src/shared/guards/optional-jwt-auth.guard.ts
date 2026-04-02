import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Retorna o usuário logado ou null caso não haja token válido.
    // Ignora erros como token expirado ou ausente para permitir o Guest Flow.
    return user || null;
  }
}
