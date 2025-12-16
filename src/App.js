import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StoryLibrary from './components/StoryLibrary';
import StoryFlow from './components/StoryFlow';
import AdminPage from './components/AdminPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<StoryLibrary />} />
          <Route path="/story/:storyId" element={<StoryFlow />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
