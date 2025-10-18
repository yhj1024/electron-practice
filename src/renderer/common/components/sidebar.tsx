import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { menuConfig } from '../config/menu-config'

export default function Sidebar() {

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    menuConfig.reduce(
      (acc, menu) => ({ ...acc, [menu.id]: true }),
      {}
    )
  )

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Hyojun Labs</h1>
      </div>

      <nav className="flex-1 px-3">
        {menuConfig.map(menu => (
          <div key={menu.id} className="mb-2">
            {/* 1depth 메뉴 */}
            <button
              onClick={() => toggleMenu(menu.id)}
              className="w-full px-4 py-3 rounded-lg text-left font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span>
                {menu.icon} {menu.label}
              </span>
              <span className="text-xs">{expandedMenus[menu.id] ? '▼' : '▶'}</span>
            </button>

            {/* 2depth 메뉴 */}
            {expandedMenus[menu.id] && menu.children && (
              <div className="ml-4 mt-1 space-y-1">
                {menu.children.map(child => (
                  <NavLink
                    key={child.id}
                    to={child.path!}
                    className={({ isActive }) =>
                      `block w-full px-4 py-2 rounded-lg text-left text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`
                    }
                  >
                    {child.icon} {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
