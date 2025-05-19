// src/components/BookingForm.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import './book.css';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pieces: 1,
    fabricType: '',
    notes: '',
    orderType: '',
    gender: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, phone, pieces } = formData;
    if (!name.trim() || !phone.trim() || pieces < 1) return;

    setSubmitting(true);

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('endTime', 'desc'));
      const snapshot = await getDocs(q);

      let lastEndTime = new Date();
      if (!snapshot.empty) {
        const lastOrder = snapshot.docs[0].data();
        const lastEnd = lastOrder.endTime.toDate();
        if (lastEnd > lastEndTime) lastEndTime = lastEnd;
      }

      const duration = pieces * 60 * 60 * 1000;
      const startTime = lastEndTime;
      const endTime = new Date(startTime.getTime() + duration);

      const newOrder = {
        ...formData,
        pieces: Number(pieces),
        startTime,
        endTime,
        status: 'قيد التنفيذ',
        createdAt: new Date(),
      };

      const docRef = await addDoc(ordersRef, newOrder);
      setOrderInfo({ orderId: docRef.id, endTime });
      setShowModal(true);

      generatePDF(docRef.id, formData, startTime, endTime);
      setFormData({ name: '', phone: '', pieces: 1, fabricType: '', notes: '', orderType: '', gender: '' });
    } catch (error) {
      alert('خطأ أثناء الحجز. حاول مرة أخرى.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = (id, data, start, end) => {
    const docDefinition = {
      content: [
        { text: `رقم الحجز: ${id}`, fontSize: 16, margin: [0, 0, 0, 10] },
        { text: `الاسم: ${data.name}`, fontSize: 14, margin: [0, 0, 0, 5] },
        { text: `رقم الهاتف: ${data.phone}`, fontSize: 14, margin: [0, 0, 0, 5] },
        { text: `عدد القطع: ${data.pieces}`, fontSize: 14, margin: [0, 0, 0, 5] },
        { text: `نوع القماش: ${data.fabricType || '-'}`, fontSize: 14, margin: [0, 0, 0, 5] },
        { text: `نوع الطلب: ${data.orderType || '-'}`, fontSize: 14, margin: [0, 0, 0, 5] },
        { text: `الملاحظات: ${data.notes || '-'}`, fontSize: 14, margin: [0, 0, 0, 10] },
        { text: `بداية التنفيذ: ${start.toLocaleString()}`, fontSize: 14, margin: [0, 0, 0, 5] },
        { text: `موعد التسليم: ${end.toLocaleString()}`, fontSize: 14, margin: [0, 0, 0, 5] },
      ],
      defaultStyle: {
        font: 'Tajawal',
        alignment: 'right',
      },
    };

    pdfMake.createPdf(docDefinition).download(`حجز_${id}.pdf`);
  };

  return (
    <div className="booking-container" dir="rtl" style={{ textAlign: 'right' }}>
      <Container className="booking-form-container">
        <div className="left-side">
          <span role="img" aria-label="rocket" className="rocket-icon">
            🚀
          </span>
          <h4>أهلاً بك</h4>
          <p> لنبدا الحجز !  </p>
        </div>
        <div className="right-side">
          <h2>نموذج الحجز</h2>
          <Form onSubmit={handleSubmit}>
            <Row className="gy-4">
              <Col md={6}>
                <Form.Group controlId="name" className="form-group" style={{ '--i': 1 }}>
                  <Form.Label>الاسم الأول *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="أدخل اسمك"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="form-group" style={{ '--i': 2 }}>
                  <Form.Label>رقم الهاتف *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="مثال: 0123456789"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="pieces" className="form-group" style={{ '--i': 3 }}>
                  <Form.Label>عدد القطع</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    name="pieces"
                    value={formData.pieces}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>

                <Form.Group controlId="orderType" className="form-group" style={{ '--i': 5 }}>
                  <Form.Label>اختر نوع الطلب *</Form.Label>
                  <Form.Select
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">اختر نوع الطلب</option>
                    <option value="رجالي">رجالي</option>
                    <option value="حريمي">حريمي</option>
                    <option value="أطفال">أطفال</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="notes" className="form-group" style={{ '--i': 6 }}>
                  <Form.Label>الملاحظات *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="أضف أي تفاصيل"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              disabled={submitting}
              className="mt-4 submit-btn"
            >
              {submitting ? 'جاري التأكيد...' : 'تأكيد الحجز'}
            </Button>
          </Form>
        </div>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered dir="rtl" style={{ textAlign: 'right' }}>
        <Modal.Header closeButton>
          <Modal.Title>تم تأكيد الحجز</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>✅ تم تسجيل حجزك بنجاح</p>
          <p>
            رقم الحجز: <strong>{orderInfo?.orderId}</strong>
          </p>
          <p>
            موعد التسليم: <strong>{orderInfo?.endTime.toLocaleString()}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default BookingForm;
