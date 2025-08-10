export interface TodoItem {
  id: string;
  todoText: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Owner{
    id: string;
  name: string;
  course_id: string;
  section: string;
}