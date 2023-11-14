import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Like, Repository } from 'typeorm';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { filter } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ){}
  async getTasks(filterDto?: GetTaskFilterDto): Promise<Task[]> {
    const {status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');

    if (status)
      query.andWhere('task.status = :status', {status});

    if (search)
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)', {search: `%${search}%`},
      );

    return await query.getMany();
  }
  // async getAllTasks(): Promise<Task[]> {
  //   return await this.tasksRepository.find();
  // }
  //
  // async getTasksWithFilter(filterDto: GetTaskFilterDto): Promise<Task[]>{
  //   const {status, search} = filterDto;
  //   return this.tasksRepository.find({
  //     where: [
  //       {status: status},
  //       {description: Like(`%${search}%`)},
  //     ]
  //   });
  // }

    async getTaskById(idTask: string): Promise<Task> {
      const found = await this.tasksRepository.findOneBy({id: idTask});

      if(!found)
        throw new NotFoundException(`Task with "${idTask}" not found`);

      return found;
    }

    async createTask(createTaskDto: CreateTaskDto):Promise<Task> {
      const {title, description} = createTaskDto;
      const task = this.tasksRepository.create({
        title,
        description,
        status: TaskStatus.OPEN,
      });

      await this.tasksRepository.save(task);
      return task;
    }

    async updateTaskStatus(id: string, status: TaskStatus): Promise<any> {
        const task = await this.tasksRepository.findOneBy({id: id});
        if(task){
          task.status = status;
          this.tasksRepository.save(task);
          return task;
        }else{
          return new NotFoundException(`Task with "${id}" not found`);
        }
    }

    async deleteTask(id: string): Promise<any>{
      this.tasksRepository.delete({id: id})
        .then((DeleteResult) => {
          return "Task Deleted Successfully!";
        })
        .catch((error) => {
          return "Error Occurred while deleting!";
        });
    }

}
