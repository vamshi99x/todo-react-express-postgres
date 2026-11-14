
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch("/todos");

  const todos: Todo[] = await response.json();

  return todos;
}

export async function postTodo(title: string): Promise<Todo> {
  const response = await fetch("/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  const todo: Todo = await response.json();

  return todo;
}

export async function putTodo(
  todo: Pick<Todo, "id" | "completed">
): Promise<Todo> {
  const response = await fetch(`/todos/${todo.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  const updatedTodo: Todo = await response.json();

  return updatedTodo;
}

export async function deleteTodo(id: number): Promise<void> {
  await fetch(`/todos/${id}`, {
    method: "DELETE",
  });
}
