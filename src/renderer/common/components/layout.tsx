import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'

export default function Layout() {
  return (
    <div className="h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
