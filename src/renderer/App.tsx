import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './common/components/layout'
import CrawlScreen from './job/pages/crawl-screen'
import JobTable from './job/pages/job-table'

export default function App() {
  return (
    <MemoryRouter initialEntries={['/job/crawl']}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 루트 접근 시 /job/crawl로 리다이렉트 */}
          <Route index element={<Navigate to="/job/crawl" replace />} />

          {/* 채용공고 관련 라우트 */}
          <Route path="job">
            <Route path="crawl" element={<CrawlScreen />} />
            <Route path="view" element={<JobTable />} />
          </Route>

          {/* 향후 추가될 도메인 */}
          {/* <Route path="saju">...</Route> */}
        </Route>
      </Routes>
    </MemoryRouter>
  )
}
