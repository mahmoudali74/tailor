import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-white text-dark py-3 mt-5">
      <Container className="text-center">
        &copy; {new Date().getFullYear()} Tailor Booking - جميع الحقوق محفوظة
      </Container>
    </footer>
  );
}

export default Footer;
