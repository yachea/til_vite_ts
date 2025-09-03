import React from 'react';
import { TodoProvider } from '../contexts/TodoContext';
import TodoWrite from '../components/todos/TodoWrite';
import TodoList from '../components/todos/TodoList';

function TodosPage() {
  return (
    <div>
      <h2>할일</h2>
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
