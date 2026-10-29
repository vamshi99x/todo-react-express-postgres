
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { getTodos, postTodo, putTodo, deleteTodo, Todo } from "./api";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}

function Todos() {
  const [title, setTitle] = useState("");
  const { data } = useQuery("todos", getTodos);
  const queryClient = useQueryClient();

  const postMutation = useMutation(postTodo, {
    onMutate: async (newTodoTitle) => {
      await queryClient.cancelQueries("todos");

      const previousTodos = queryClient.getQueryData("todos");

      queryClient.setQueryData(
        "todos",
        (old: Todo[] | undefined) => [
          ...(old ?? []),
          {
            id: Date.now(),
            title: newTodoTitle,
            completed: false,
          },
        ]
      );

      setTitle("");

      return { previousTodos, newTodoTitle };
    },
    onError: (_err, _newTodoTitle, context) => {
      queryClient.setQueryData(
        "todos",
        context?.previousTodos ?? []
      );
      setTitle(context?.newTodoTitle ?? "");
    },
    onSettled: () => {
      queryClient.invalidateQueries("todos");
    },
  });

  const putMutation = useMutation(putTodo, {
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries("todos");

      const previousTodos = queryClient.getQueryData("todos");

      queryClient.setQueryData(
        "todos",
        (old: Todo[] | undefined) =>
          old?.map((todo) =>
            todo.id === updatedTodo.id
              ? { ...todo, ...updatedTodo }
              : todo
          ) ?? []
      );

      return { previousTodos };
    },
    onError: (_err, _updatedTodo, context) => {
      queryClient.setQueryData(
        "todos",
        context?.previousTodos ?? []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries("todos");
    },
  });

  const deleteMutation = useMutation(deleteTodo, {
    onMutate: async (id) => {
      await queryClient.cancelQueries("todos");

      const previousTodos = queryClient.getQueryData("todos");

      queryClient.setQueryData(
        "todos",
        (old: Todo[] | undefined) =>
          old?.filter((todo) => todo.id !== id) ?? []
      );

      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(
        "todos",
        context?.previousTodos ?? []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries("todos");
    },
  });

  return (
    <div className="min-h-screen bg-emerald-950 text-red">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-blue-950/30">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-100">
            Stay organized
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-red">
            Todo Dashboard
          </h1>
          <p className="mt-3 text-blue-100">
            Plan your day. Track your progress. Get things done.
          </p>
        </header>

        <main className="flex flex-col gap-5">
          <form
            className="flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();

              if (title.trim()) {
                postMutation.mutate(title.trim());
              }
            }}
          >
            <input
              type="text"
              placeholder="What needs to get done?"
              aria-label="New todo title"
              className="h-12 min-w-0 grow rounded-xl border border-slate-700 bg-slate-900 px-4 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <button
              type="submit"
              disabled={!title.trim() || postMutation.isLoading}
              className="h-12 rounded-xl bg-blue-500 px-5 font-semibold transition hover:bg-blue-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {postMutation.isLoading ? "Adding..." : "+ Add"}
            </button>
          </form>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your tasks</h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              {data?.length ?? 0} tasks
            </span>
          </div>

          <ul className="flex flex-col gap-3">
            {data?.length ? (
              [...data]
                .sort((a, b) => a.id - b.id)
                .map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      aria-label={`Mark ${todo.title} as completed`}
                      onChange={(e) =>
                        putMutation.mutate({
                          id: todo.id,
                          completed: e.target.checked,
                        })
                      }
                      className="h-5 w-5 shrink-0 accent-blue-500"
                    />

                    <p
                      className={`grow break-words ${
                        todo.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-100"
                      }`}
                    >
                      {todo.title}
                    </p>

                    <button
                      type="button"
                      disabled={deleteMutation.isLoading}
                      className="rounded-lg border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                      onClick={() => deleteMutation.mutate(todo.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))
            ) : (
              <li className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
                {data
                  ? "No tasks yet. Add your first task above!"
                  : "Loading your tasks..."}
              </li>
            )}
          </ul>
        </main>

        <footer className="text-center text-sm text-slate-500">
          Small steps every day lead to big results.
        </footer>
      </div>
    </div>
  );
}
