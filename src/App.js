import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StoryLibrary from './components/StoryLibrary';
import StoryFlow from './components/StoryFlow';
import ApiKeyScreen from './components/ApiKeyScreen';
import ChatInterface from './components/ChatInterface';
import AdminPage from './components/AdminPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoryLibrary />} />
        <Route path="/story/:storyId" element={<StoryFlow />} />
        <Route path="/apikey/:storyId" element={<ApiKeyScreen />} />
        <Route path="/chat/:storyId" element={<ChatInterface />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;