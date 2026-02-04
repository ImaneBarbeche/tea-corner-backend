import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Get(':id')
    findOne(@Param('id') id: string): string {
        
        return `This action returns a #${id} cat`
        // return 'This action returns a user';
    }
    
}

// FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator