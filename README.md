# 스타일 정리

## 1. css 기본 코드

- /src/index.css 업데이트

```css
/* ===== CSS Reset & Base Styles ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  outline-style: none;
}

html {
  /* 가로 스크롤은 일반적으로 x만 가림 */
  overflow-x: hidden;
  font-size: 16px;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
  color: #1e293b;
  line-height: 1.6;
}

/* ===== Link Styles ===== */
a {
  text-decoration: none;
  color: #3b82f6;
  /*  중간단계에서 color은  0.2초 동안 부드럽게 변함 */
  transition: color 0.2s ease;
}

a:hover {
  color: #1e40af;
}

a:focus {
  color: #1e40af;
  /* var 는 css 에서 변수 사용하는 경우 */
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* 버튼 클래스를 가진 링크는 색상 변경하지 않음 */
a.btn {
  /* inherit 은 상속으로서 색상을 지정된 것을 사용 */
  color: inherit;
}

a.btn:hover {
  color: inherit;
}

a.btn:focus {
  color: inherit;
}

/* ===== List Styles ===== */
/* 통상 ul 은 모양없이 진행함. */
/* ol은 order list 로서 순서가 있는 목록 */
ul,
li {
  list-style: none;
}

/* ===== Button Base Styles ===== */
button {
  font-family: inherit;
  /* 버튼은 보통 마우스 커서를 pointer 설정 */
  cursor: pointer;
  border: none;
  border-radius: 8px;
  /* color 뿐만 아니라 모든 css 속성을 0.2s 동안 효과 */
  transition: all 0.2s ease;
}
/* 버튼이 비활성화시 처리 */
button:disabled {
  opacity: 0.6;
  /* 버튼의 마우스 커서 오버시 보이는 모양 */
  cursor: not-allowed;
}

/* ===== Input Base Styles ===== */
input,
textarea {
  font-family: inherit;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 12px;
  /* 중간모션 설정에서 여러개를 조금씩 적용이 다를때 */
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

input:focus,
textarea:focus {
  outline: none;
  /* css 변수사용하기 : var (변수명) */
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ===== Design System Variables ===== */
/*  css에서 변수를 만들 때 */
:root {
  /* Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-300: #93c5fd;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;

  --success-50: #ecfdf5;
  --success-300: #6ee7b7;
  --success-500: #10b981;
  --success-600: #059669;

  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Spacing */
  /* rem 은 html 의 폰트사이즈를 기준으로 배수로 계산 */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  /* 1rem 이 현재는 16px */
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* ===== Utility Classes ===== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-600);
  color: white;
}

.btn-primary:focus {
  background-color: var(--primary-600);
  color: white;
  outline: 2px solid var(--primary-300);
  outline-offset: 2px;
}

.btn-success {
  background-color: var(--success-500);
  color: white;
}

.btn-success:hover {
  background-color: var(--success-600);
  color: white;
}

.btn-success:focus {
  background-color: var(--success-600);
  color: white;
  outline: 2px solid var(--success-300);
  outline-offset: 2px;
}

.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background-color: var(--gray-200);
  color: var(--gray-700);
}

.btn-secondary:focus {
  background-color: var(--gray-200);
  color: var(--gray-700);
  outline: 2px solid var(--gray-400);
  outline-offset: 2px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  color: white;
}

.btn-danger:focus {
  background-color: #c82333;
  color: white;
  outline: 2px solid #f5c6cb;
  outline-offset: 2px;
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: 16px;
}

/* ===== Form Styles ===== */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.form-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* ===== Layout Components ===== */
.page-header {
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--gray-600);
}

/* ===== Todo Specific Styles ===== */
.todo-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  margin-bottom: var(--space-2);
  transition: all 0.2s ease;
}

.todo-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.todo-item.completed {
  opacity: 0.7;
  background-color: var(--gray-50);
}

.todo-number {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
  color: var(--primary-600);
  font-size: 14px;
}

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.todo-title {
  font-size: 14px;
  color: var(--gray-900);
}

.todo-title.completed {
  /* 중간 취소선 */
  text-decoration: line-through;
  color: var(--gray-500);
}

.todo-date {
  font-size: 12px;
  color: var(--gray-500);
  font-style: italic;
}

.todo-actions {
  display: flex;
  gap: var(--space-2);
}

/* ===== Navigation Styles ===== */
.nav {
  display: flex;
  gap: var(--space-6);
  /* 영역에 오른쪽 끝으로 정렬할 때 */
  justify-content: flex-end;
  padding: var(--space-6) var(--space-8);
  background: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-6);
}

.nav-link {
  color: var(--gray-600);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--primary-800);
  background-color: var(--primary-100);
}

.nav-link:focus {
  color: var(--primary-800);
  background-color: var(--primary-100);
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* ===== Loading States ===== */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--gray-500);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 흐린 효과 */
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  background: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
}

.loading-text {
  color: var(--gray-600);
  font-weight: 500;
  text-align: center;
}

.spinner {
  position: relative;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary-500);
  border-radius: 50%;
  /* animation : 모션이름 모션시간 시간왜곡 무한루프 모션반대로 진행 */
  animation: spin 1s linear infinite reverse;
}

.spinner-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  height: 30%;
  border: 1px solid var(--primary-300);
  border-top: 1px solid var(--primary-600);
  border-radius: 50%;
  animation: spin 0.5s linear infinite reverse;
}

/* Legacy loading class for backward compatibility */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--gray-500);
}

/* 사용자가 애니메이션을 지정해서 진행함 */
/* https://animate.style/ 를 활용하길 권장 */
@keyframes spin {
  /* 0% : 애니메이션 시작 css */
  0% {
    transform: rotate(0deg);
  }
  /* 100% : 애니메이션 마무리 css */
  100% {
    transform: rotate(360deg);
  }
}

/* Loading skeleton for better UX */
.loading-skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Todo item loading skeleton */
.todo-skeleton {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  margin-bottom: var(--space-2);
}

.todo-skeleton .skeleton-number {
  width: 30px;
  height: 20px;
}

.todo-skeleton .skeleton-checkbox {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
}

.todo-skeleton .skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.todo-skeleton .skeleton-title {
  width: 70%;
  height: 16px;
}

.todo-skeleton .skeleton-date {
  width: 50%;
  height: 12px;
}

.todo-skeleton .skeleton-actions {
  display: flex;
  gap: var(--space-2);
}

.todo-skeleton .skeleton-button {
  width: 60px;
  height: 32px;
  border-radius: var(--radius-md);
}

/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-3);
  }

  .nav {
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
  }

  .todo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .todo-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

/* ===== Admin Page Styles ===== */
.admin-request-item {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.admin-request-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.admin-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--gray-200);
}

.admin-status-badge {
  background-color: var(--primary-100);
  color: var(--primary-700);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
}

.admin-request-details {
  margin-bottom: var(--space-4);
}

.admin-detail-row {
  display: flex;
  margin-bottom: var(--space-2);
  align-items: flex-start;
}

.admin-detail-label {
  font-weight: 500;
  color: var(--gray-700);
  min-width: 100px;
  margin-right: var(--space-3);
}

.admin-detail-value {
  color: var(--gray-600);
  flex: 1;
  word-break: break-all;
}

.admin-request-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-3);
  border-top: 1px solid var(--gray-200);
}

/* ===== Legacy Styles (to be removed) ===== */
.sports-event {
  background-color: #f08080 !important;
  color: #fff !important;
}
.science-event {
  background-color: #4682b4 !important;
  color: #fff !important;
}
```

## 2. App.tsx css 정리

## 3. /src/pages/HomePage.tsx 정리

## 4. /src/pages/SignUpPage.tsx 정리

## 5. /src/pages/SignInPage.tsx 정리

## 6. /src/pages/TodosPage.tsx 정리

## 7. /src/pages/TodosInfinitePage.tsx 정리

# 라우터 정리(할일을 별도 페이지로)
