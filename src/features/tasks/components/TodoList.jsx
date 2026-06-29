import TodoItem from './TodoItem'

function TodoList({
  todos,
  onToggle,
  onEdit,
  onDelete,
  canManage,
  canDelete,
}) {
  if (todos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center">
        <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-lg text-slate-500">
          ✓
        </div>
        <p className="text-sm font-medium text-slate-400">모든 작업을 마쳤어요.</p>
        <p className="mt-1 text-xs text-slate-600">새로운 할 일을 추가해 보세요.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
          canDelete={canDelete}
        />
      ))}
    </ul>
  )
}

export default TodoList
