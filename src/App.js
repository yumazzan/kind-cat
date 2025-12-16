import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StoryLibrary from './components/StoryLibrary';
import StoryFlow from './components/StoryFlow';
import AdminPage from './components/AdminPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 관리자 페이지 */}
          <Route 
            path="/admin" 
            element={<AdminPage />} 
          />
          
          {/* 스토리 라이브러리 (메인) */}
          <Route 
            path="/" 
            element={<StoryLibrary />} 
          />
          
          {/* 스토리 플로우 (API 키 → 채팅) */}
          <Route 
            path="/story/:storyId" 
            element={<StoryFlow />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;