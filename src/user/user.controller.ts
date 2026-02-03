import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';

@Controller('user')
export class UserController {

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return 'This action adds a new user';
    }
    @Get(':id')
    findOne() {
        return 'This action returns a user';
    }
}

// FindOneParams, like a DTO, is simply a class that defines validation rules using class-validator