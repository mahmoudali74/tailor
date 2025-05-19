import React, { useState } from 'react';
import { Navbar, Container, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function CustomNavbar() {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    if (username && password === 'admin123') {
      localStorage.setItem('adminName', username);
      setShowModal(false);
      setUsername('');
      setPassword('');
      setError('');
      navigate('/a'); // انتقال لصفحة الأدمن
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <>
      <Navbar bg="white" variant="white" dir="rtl">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand
            href="#"
            style={{
              color: 'black',
              fontWeight: '700',    // عريض وثقيل
              fontSize: '1.8rem',   // حجم كبير وواضح
              textDecoration: 'none',  // إزالة أي خط تحت النص
              fontFamily: 'Arial, sans-serif' // خط واضح
            }}
          >
            🧵 خيط وإبرة
          </Navbar.Brand>


          <div className="d-flex gap-2">
            <Button
              variant="primary"
              className="rounded-pill fw-bold shadow-sm"
              onClick={() => navigate('/')}
            >
              الحجز
            </Button>
            <Button
              variant="dark"
              className="rounded-pill fw-bold shadow-sm"
              onClick={() => setShowModal(true)}
            >
              الأدمن
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Modal تسجيل دخول الأدمن */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>دخول الأدمن</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>اسم المستخدم:</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>كلمة المرور:</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
            {error && <p className="text-danger mt-2">{error}</p>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleAdminAccess}>
            دخول
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CustomNavbar;
