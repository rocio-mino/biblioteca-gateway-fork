import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';

import {
  verificar,
  tieneScope,
  estaEnGrupo,
} from './auth/verificador';

@Controller('v1/prestamos')
export class PrestamosController {

  @Get()
  async listar(
    @Headers('authorization') authorization?: string,
  ): Promise<unknown> {

    // ── autenticación ──
    let claims;

    try {
      claims = await verificar(authorization);
    } catch (e) {
      throw new UnauthorizedException((e as Error).message);
    }

    // ── autorización por scope ──
    if (!tieneScope(claims, 'biblioteca/libros.leer')) {
      throw new ForbiddenException(
        'te falta el permiso biblioteca/libros.leer',
      );
    }

    // ── autorización por grupo ──
    if (!estaEnGrupo(claims, 'bibliotecarios')) {
      throw new ForbiddenException(
        'te falta el grupo bibliotecarios',
      );
    }

    const respuesta = await fetch(
      'http://localhost:3002/prestamos',
    );

    return respuesta.json();
  }
}