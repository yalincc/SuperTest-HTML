import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, XCircle, BarChart3 } from 'lucide-react'

function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[800px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-text hover:text-primary transition">
            <span className="text-xl">📝</span>
            <span className="font-bold">SuperTest</span>
          </Link>
          <nav className="flex items-center gap-3">
            {!isHome && (
              <Link to="/" className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">首页</span>
              </Link>
            )}
            <Link to="/wrongbook" className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">错题本</span>
            </Link>
            <Link to="/stats" className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">统计</span>
            </Link>
            <Link to="/exam" className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">模拟考试</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
