import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(phone: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { unit: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const payload = { 
      sub: user.id, 
      phone: user.phone, 
      role: user.role, 
      unitId: user.unitId 
    };

    return {
      token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        unitId: user.unitId,
        unitName: user.unit?.name,
      }
    };
  }
}
