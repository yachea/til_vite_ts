/**
 * 사용자 프로필 관리
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 *  주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { profile, profileInsert, profileUpdate } from '../types/TodoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: profileInsert): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패 : ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = async (userId: string): Promise<profile | null> => {
  try {
    const { error, data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.log(error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 사용자 프로필 수정
const updateProgile = async (editUserProfile: profileUpdate, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...editUserProfile })
      .eq('id', userId);
    if (error) {
      console.log(error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 사용자 프로필 삭제
const deleteProfile = () => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    // 파일 타입 검사
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
    }
    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
    }

    // 기존에 만약 아바타 이미지가 있으면 무조건 삭제부터 합니다.
    const result = await cleanupUserAvatars(userId);
    if (!result) {
      console.log('파일 못 지웠어요.');
    }

    // 파일명이 중복되지 않도록 이름을 생성함.
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // storage 에 bucket 이 존재하는지 검사
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      throw new Error(`Storage 버킷 확인 실패 : ${bucketError.message}`);
    }
    // bucket 들의 목록 전달 {} 형태로 나옴. user-images 라는 이름에 업로드
    let profileImagesBucket = buckets.find(item => item.name === 'user-images');
    if (!profileImagesBucket) {
      throw new Error('user-images 버킷이 존재하지 않음. 버킷생성 필요!!');
    }
    // 파일 업로드 : upload(파일명, 실제파일, 옵션)
    const { data, error } = await supabase.storage.from('user-images').upload(filePath, file, {
      cacheControl: '3600', // 3600 초는 1시간 동안 파일 캐시 적용
      upsert: false, // 동일한 파일명은 덮어씌운다.
    });
    if (error) {
      throw new Error(`업로드 실패 : ${error.message}`);
    }
    // https 문자열로 주소를 알아내서 활용
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-images').getPublicUrl(filePath);
    return publicUrl;
  } catch (error) {
    throw new Error(`아바타 업로드 오류가 발생했습니다. : ${error}`);
  }
};

// 아바타 이미지는 한장을 유지해야 하므로 모두 제거하는 기능 필요
const cleanupUserAvatars = async (userId: string): Promise<boolean> => {
  try {
    const { data, error: listError } = await supabase.storage
      .from('user-images')
      .list('avatars', { limit: 1000 });
    if (listError) {
      console.log(`목록 요청 에러 : ${listError.message}`);
      return false;
    }
    // userId 에 해당하는 것만 필터링 해서 삭제해야 함.
    if (data && data.length > 0) {
      const userFile = data.filter(item => item.name.startsWith(`${userId}-`));
      if (userFile && userFile.length > 0) {
        const filePaths = userFile.map(item => `avatars/${item.name}`);
        const { error: removeError } = await supabase.storage.from('user-images').remove(filePaths);
        if (removeError) {
          console.log(`파일 삭제 에러 : ${removeError.message}`);
          return false;
        }
        return true;
      }
    }
    return true;
  } catch (error) {
    console.log(`아바타 이미지 전체 삭제 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 이미지 제거
const removeAvatar = async (userId: string): Promise<boolean> => {
  try {
    // 현재 로그인한 사용자의 avartar_url 을 읽어와야 합니다.
    // 여기서 파일명을 추출함.
    const profile = await getProfile(userId);
    // 사용자가 avatar_url ㅇ ㅣ없다면
    if (!profile?.avatar_url) {
      return true; // 작업완료
    }
    // 1. 만약 avatar_url 이 존재하면 이름 파악, 파일 삭제
    let deleteSuccess = false;

    try {
      //  url 에 파일명을 찾아야 함. (url 로 변환하면 path 와 파일구분수월함)
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
        const bucketName = pathParts[publicIndex + 1];
        const filePath = pathParts.slice(publicIndex + 2).join('/');
        // 실제로 찾아낸 bucketName 과 filePath 로 삭제
        const { data, error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) {
          throw new Error('파일을 찾았지만, 삭제에는 실패했어요.');
        }
        // 파일 삭제 성공
        deleteSuccess = true;
      }
    } catch (err) {
      console.log(err);
    }

    // 2. 만약 avatar_url 을 제대로 파싱 못했다면?
    if (!deleteSuccess) {
      try {
        // 전체 목록을 일단 읽어옴
        const { data: files, error: listError } = await supabase.storage
          .from('user-images')
          .list('avatars', { limit: 1000 });
        if (!listError && files && files.length > 0) {
          const userFiles = files.filter(item => item.name.startsWith(`${userId}-`));
          if (userFiles.length > 0) {
            const filePath = userFiles.map(item => `avatars/${item.name}`);
            const { error } = await supabase.storage.from('user-images').remove(filePath);
            if (!error) {
              deleteSuccess = true;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 내보내기
export { createProfile, getProfile, updateProgile, deleteProfile, uploadAvatar, removeAvatar };
