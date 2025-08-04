import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import MusicApiDemo from './pages/MusicApiDemo'
import './App.css'

function Home() {
  return (
    <div>
      <h1>AI App Template</h1>
      <nav>
        <ul>
          <li>
            <Link to="/music-api-demo">Music API Demo</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music-api-demo" element={<MusicApiDemo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
