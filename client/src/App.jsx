import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import CategoryPage from './pages/CategoryPage';
import { FiltersProvider } from './context/FiltersContext';

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  return (
    <BrowserRouter>
      <FiltersProvider>
        <div className={`${dark ? "dark" : ""} min-h-screen bg-gray-50 dark:bg-gray-900`}>
          <Header dark={dark} setDark={setDark} />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/category" element={<CategoryPage />} />
          </Routes>

          <Footer />
        </div>
      </FiltersProvider>
    </BrowserRouter>
  );
}