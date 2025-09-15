import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, removeAvatar, updateProgile, uploadAvatar } from '../lib/profile';
import type { profile, profileUpdate } from '../types/TodoType';
import Loading from '../components/Loading';

/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원탈퇴 기능 : 확인을 거치고 진행하도록
 */
function ProfilePage() {
  // 회원 기본 정보
  const { user, deleteAccount } = useAuth();
  // 데이터 가져오는 동안의 로딩
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<profile | null>(null);
  // 에러 메시지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [edit, setEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 아바타 이미지를 위한 상태관리
  // 이미지 업로드 상태 표현
  const [uploading, setUploading] = useState<boolean>(false);
  // 미리보기 이미지 url (문자열)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 실제 파일 (바이너리)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 사용자가 새로운 이미지 선택시 즉, 편집 중인 경우 원본 URL 보관용 문자열
  const [originalAvatarUrl, setOriginalAvartarUrl] = useState<string | null>(null);
  // 이미지 제거 요청 상태(그러나, 실제 file 제거는 수정확인 버튼 눌렀을 때 처리)
  const [imageRemovalRequest, setImageRemovalReauest] = useState<boolean>(false);
  // input type="file" 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보 가져오기 ( null 일수도 있다. )
      const tempData = await getProfile(user?.id);

      if (!tempData) {
        // null 이라면
        setError('사용자 프로필 정보를 찾을 수 없습니다.');
        return;
      }
      // 사용자 정보가 있다.
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (err) {
      console.log(err);
      setError('사용자 프로필 호출 오류!!!');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 데이터 업데이트
  const saveProfile = async () => {
    if (!user) {
      return;
    }
    if (!profileData) {
      return;
    }
    // 여러개가 업로드 되면 안됨
    setLoading(true);

    try {
      let imgUrl = originalAvatarUrl; // 원본 이미지 URL
      // 아바타이미지 제거라면
      if (imageRemovalRequest) {
        // storage 에 실제 이미지를 제거함.
        const success = await removeAvatar(user.id);
        if (success) {
          imgUrl = null;
        } else {
          alert('이미지 제거에 실패했습니다. 기존 이미지가 유지 됩니다.');
        }
      } else if (selectedFile) {
        // 새로운 이미지가 업로드 된다면
        const uploadedImageUrl = await uploadAvatar(selectedFile, user.id);
        if (uploadedImageUrl) {
          // 실제로 업로드 완료 후 전달받은 URL 문자열을 보관함.
          // profiles 테이블에 avatar_url 에 넣어줄 문자열
          imgUrl = uploadedImageUrl;
        } else {
          alert('이미지 업로드에 실패했습니다. 닉네임만 저장합니다.');
        }
      }

      // 실제로 업데이트 진행 부분
      const tempUpdateData: profileUpdate = { nickname: nickName, avatar_url: imgUrl };

      const success = await updateProgile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패하였습니다.');
        return;
      }
      // 업데이트 성공시 초기화 진행
      setPreviewImage(null);
      setSelectedFile(null);
      setImageRemovalReauest(false);
      setOriginalAvartarUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadProfile();
      alert('프로필이 성공적으로 업데이트 되었습니다.');
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setEdit(false);
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    const message: string = '😥 계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  // 이미지 파일 선택 처리(미리보기)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
      return;
    }

    // 미리보기 생성 (파일을 글자로 변환한 것..)
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    // 새 이미지 선택 시 이미지 제거 요청 상태 초기화
    setImageRemovalReauest(false);
  };
  // 이미지 파일 선택 취소
  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 제거 처리
  const handleRemoveImage = () => {
    const ok = confirm('프로필 이미지를 제거하시겠습니까?');
    if (!ok) {
      return;
    }
    // 즉시 제거하지 않습니다.
    // 제거하라는 상태만 별도로 관리함.
    setImageRemovalReauest(true);
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <Loading message="프로필 정보를 불러오는 중 ..." size="lg" />;
  }
  // error 메시지 출력하기
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="page-title">⚠️ 프로필 오류</h2>
        <div style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>{error}</div>
        <button onClick={loadProfile} className="btn btn-primary">
          재시도
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">👤 회원정보</h2>
        <p className="page-subtitle">개인 정보를 확인하고 수정하세요.</p>
      </div>
      {/* 사용자 기본 정보 섹션 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray--800)' }}>📧 기본 정보</h3>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {user?.email}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">가입일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {user?.created_at && new Date(user.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      {/* 사용자 추가정보 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray--800)' }}>
          👤 사용자 추가 정보
        </h3>
        <div className="form-group">
          <label className="form-label">아이디</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {profileData?.id}
          </div>
        </div>
        {edit ? (
          <>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input
                type="text"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                className="form-input"
                placeholder="닉네임을 입력하세요."
              />
            </div>
            <div className="form-group">
              <label className="form-label">아바타 편집</label>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                {previewImage ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={previewImage}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid var(--primary-500)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary-600)',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      새로운 이미지 미리보기
                    </p>
                  </div>
                ) : imageRemovalRequest ? (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed #dc3545',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '11px',
                          color: '#dc3545',
                          fontWeight: 'bold',
                        }}
                      >
                        이미지 제거됨
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#dc3545',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      이미지가 제거되었습니다
                    </p>
                  </div>
                ) : originalAvatarUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={originalAvatarUrl}
                      alt="현재 아바타"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid var(--success-500)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--success-600)',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      현재 아바타
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed var(--gray-400)',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '11px',
                          color: 'var(--gray-500)',
                          fontWeight: 'bold',
                        }}
                      >
                        이미지 없음
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--gray-500)',
                        marginTop: 'var(--space-2)',
                      }}
                    >
                      아바타 이미지를 설정해보세요
                    </p>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <button
                      className={`btn ${uploading ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </button>

                    {previewImage && (
                      <button
                        className={`btn btn-secondary`}
                        disabled={uploading}
                        onClick={handleCancelUpload}
                      >
                        취소
                      </button>
                    )}

                    {!previewImage && !imageRemovalRequest && originalAvatarUrl && (
                      <button
                        className="btn"
                        style={{
                          backgroundColor: uploading ? 'var(--gray-300)' : '#dc3545',
                          color: 'white',
                        }}
                        onClick={handleRemoveImage}
                      >
                        {uploading ? '처리 중...' : '이미지 제거'}
                      </button>
                    )}

                    {imageRemovalRequest && (
                      <button
                        disabled={uploading}
                        className={`btn ${uploading ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => {
                          setImageRemovalReauest(false);
                        }}
                      >
                        제거 취소
                      </button>
                    )}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--gray-500)',
                    marginTop: 'var(--space-2)',
                    textAlign: 'center',
                  }}
                >
                  지원 형식 : JPEG, PNG, GIF (최대 5MB)
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--gray-700)',
                }}
              >
                {profileData?.nickname || '닉네임이 설정되지 않았습니다'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🖼️ 아바타</label>
              <div style={{ textAlign: 'center' }}>
                {profileData?.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="프로필 이미지"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '3px solid var(--success-500)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed var(--gray-400)',
                      margin: '0 auto',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 'bold' }}>
                      이미지 없음
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">가입일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {edit ? (
          <>
            <button
              className={`btn btn-lg ${uploading ? 'btn-secondary' : 'btn-primary'}`}
              disabled={uploading}
              onClick={saveProfile}
            >
              {uploading ? '저장 중...' : '수정확인'}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setEdit(false);
                setNickName(profileData?.nickname || '');
                setPreviewImage(null);
                setSelectedFile(null);
                setImageRemovalReauest(false);
                setOriginalAvartarUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              수정취소
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setEdit(true);
                // 편집 시작 시 원본 이미지 URL 저장
                setOriginalAvartarUrl(profileData?.avatar_url || null);
                setImageRemovalReauest(false);
              }}
            >
              정보수정
            </button>
            <button className="btn btn-danger btn-lg" onClick={handleDeleteUser}>
              회원탈퇴
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
