import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: String;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}