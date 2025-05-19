// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import AdminPanel from './components/Admin';
import CustomNavbar from './components/shard/Navbar';
import Footer from './components/shard/Footer';


function App() {
  return (
    <Router>
      <CustomNavbar/>
      <Routes>

        <Route path="/" element={<BookingForm/>} />
        <Route path="/a" element={<AdminPanel/>} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
