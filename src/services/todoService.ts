import { supabase } from '../lib/supabase';
import type { Todo, TodoInsert, TodoUpdate } from '../types/TodoType';

// Todo 목록 조회
export const getTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  // 실행은 되었지만, 결과가 오류이다.
  if (error) {
    throw new Error(`getTodos 오류 : ${error.message}`);
  }
  return data || [];
};
// Todo 생성
export const createTodos = async (newTodo: TodoInsert): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...newTodo, completed: false }])
      .select()
      .single();
    if (error) {
      throw new Error(`createTodos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 수정
export const updateTodos = async (id: number, editTitle: TodoUpdate): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update({ ...editTitle, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw new Error(`updateTodos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 삭제
export const deleteTodos = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      throw new Error(`deleteTodos 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};
// completed toggle
export const toggleTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
  return updateTodos(id, { completed });
};
