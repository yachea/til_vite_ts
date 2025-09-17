import React from 'react';

interface PaginationProps {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}

const Pagination = ({
  totalCount,
  totalPages,
  currentPage,
  itemsPerPage,
  handleChangePage,
}: PaginationProps): JSX.Element => {
  // ts 자리

  // 시작 번호를 생성함.
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  // 마지막 번호를 생성함.
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // 페이지 번호 버튼들을 생성함
  const getPageNumbers = () => {
    const pages = [];
    // 한 화면에 몇개의 버튼들을 출력할 것인가?
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      // 현재 5 페이지보다 적은 경우
      for (let i = 1; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 5 페이지보다 큰 경우
      // 시나리오
      // ...currentpage-2 currentpage-1 currentpage currentpage+1 currentpage+2...
      // 현재 페이지를 중심으로 앞뒤 2개씩 표현
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      // 시작페이지가 1 보다 크면 첫 페이지와 ... 추가
      if (startPage > 1) {
        pages.push(1); // [1]
        if (startPage > 2) {
          pages.push('...'); // [1, "..."]
        }
      }
      // 중간 페이지를 추가
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      // 끝 페이지가 마지막 보다 작으면 ... 과 페이지 추가
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 페이지네이션이 무조건 나오는 것은 아닙니다.
  if (totalPages <= 1) {
    return <></>;
  }

  // tsx 자리
  return (
    <div className="pagination-container">
      {/* 페이지정보 */}
      <div className="pagination-info">
        총<span className="pagination-count">{totalCount}</span>개 중{' '}
        <span className="pagination-range">
          {startItem} ~ {endItem}
        </span>
        개 표시
      </div>
      {/* 페이지 번호들 */}
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => handleChangePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>
        {/* 버튼들 출력 */}
        <div className="pagination-numbers">
          {pageNumbers.map((item, indedx) => (
            <React.Fragment key={indedx}>
              {item === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  className={`pagination-btn pagination-btn-number ${item === currentPage ? 'active' : ''}`}
                  onClick={() => handleChangePage(item as number)}
                >
                  {item}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          className="pagination-btn"
          onClick={() => handleChangePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;
