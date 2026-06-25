import { HashRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import SubjectPage from './pages/SubjectPage'
import TopicPage from './pages/TopicPage'
import PracticePage from './pages/PracticePage'
import WrongBookPage from './pages/WrongBookPage'
import ExamPage from './pages/ExamPage'
import StatsPage from './pages/StatsPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/subject/:subject" element={<SubjectPage />} />
          <Route path="/subject/:subject/topic/:topicId" element={<TopicPage />} />
          <Route path="/practice/:subject" element={<PracticePage />} />
          <Route path="/wrongbook" element={<WrongBookPage />} />
          <Route path="/wrongbook/:subject" element={<WrongBookPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
