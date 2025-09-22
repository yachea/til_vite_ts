import { supabase } from '../lib/supabase';
import type { Memo, MemoInsert, MemoUpdate } from '../types/MemoType';

// MemoType.ts 에서 추출
// export type Memo = Database['public']['Tables']['memos']['Row'];
// export type MemoInsert = Database['public']['Tables']['memos']['Insert'];
// export type MemoUpdate = Database['public']['Tables']['memos']['Update'];

// Memo  목록 조회
export const getMemos = async (): Promise<Memo[]> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`getMemos 오류 : ${error.message}`);
  }
  return data || [];
};

// Memo  목록 조회 id 이용
export const getMemoById = async (id: number): Promise<Memo | null> => {
  try {
    const { data, error } = await supabase.from('memos').select('*').eq('id', id).single();
    if (error) {
      throw new Error(`getMemoById 오류 : ${error.message}`);
    }
    return data;
  } catch (err) {
    console.log('getMemoById 에러 :', err);
    return null;
  }
};

// Memo  생성
export const createMemos = async (newTodo: Omit<MemoInsert, 'user_id'>): Promise<Memo | null> => {
  try {
    // 현재 로그인 한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }
    const { data, error } = await supabase
      .from('memos')
      .insert([{ ...newTodo, completed: false, user_id: user.id }])
      .select()
      .single();
    if (error) {
      throw new Error(`createMemos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Memo  수정

export const updateMemos = async (
  id: number,
  updateData: Omit<MemoUpdate, 'user_id'>,
): Promise<Memo | null> => {
  try {
    const { data, error } = await supabase
      .from('memos')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw new Error(`updateMemos 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Memo  삭제
export const deleteMemos = async (id: number): Promise<void> => {
  try {
    // 1. 먼저 삭제할 todo 의 content 에서 이미지의 url 만 추출한다.
    const { data: memo, error: fetchError } = await supabase
      .from('memos')
      .select('content, user_id')
      .eq('id', id)
      .single();
    if (fetchError) {
      throw new Error(`deleteMemos fetch 오류 : ${fetchError.message}`);
    }
    const { error } = await supabase.from('memos').delete().eq('id', id);
    if (error) {
      throw new Error(`deleteMemos 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};
