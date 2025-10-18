/**
 * 메뉴 설정
 * 새 메뉴 추가 시 이 파일만 수정하면 됨
 */

export interface MenuItem {
  id: string
  label: string
  icon: string
  path?: string // 2depth 메뉴만 path 있음
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  {
    id: 'job',
    label: '채용공고',
    icon: '📋',
    children: [
      {
        id: 'job-crawl',
        label: '크롤링',
        icon: '🚀',
        path: '/job/crawl',
      },
      {
        id: 'job-view',
        label: '공고 조회',
        icon: '📂',
        path: '/job/view',
      },
    ],
  },
  // 향후 메뉴 추가 예시:
  // {
  //   id: 'saju',
  //   label: '사주',
  //   icon: '🔮',
  //   children: [
  //     { id: 'saju-input', label: '사주 입력', icon: '✍️', path: '/saju/input' },
  //     { id: 'saju-result', label: '결과 보기', icon: '📊', path: '/saju/result' },
  //   ],
  // },
]
