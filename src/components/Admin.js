import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Table,
  Badge, Button, Spinner, Form, InputGroup, Modal, Alert, Navbar, Nav
} from 'react-bootstrap';
import { db } from './firebase';
import {
  collection, getDocs, updateDoc,
  deleteDoc, doc, query, orderBy, onSnapshot
} from 'firebase/firestore';
import './admin.css';

function AdminDashboard({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPendingCount, setNewPendingCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);

      const pending = data.filter(order => order.status === 'pending');
      setNewPendingCount(pending.length);
    });

    return () => unsubscribe();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id) => {
    await updateDoc(doc(db, 'orders', id), { status: 'done' });
    setNewPendingCount(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب؟')) {
      await deleteDoc(doc(db, 'orders', id));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesPhone = searchPhone ? order.phone.includes(searchPhone) : true;
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    return matchesPhone && matchesStatus;
  });

  const getRowClass = (status) => {
    if (status === 'done') return 'done';
    if (status === 'pending') return 'pending';
    return '';
  };

  const getTimeFromDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime?.seconds * 1000);
    const diff = end - now;
    if (diff <= 0) return 'انتهى';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours} س ${minutes} د`;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDateOnly = (timestamp) => {
    return new Date(timestamp?.seconds * 1000).toISOString().split('T')[0];
  };

  const getTodayOrdersCount = () => {
    const todayDate = getTodayDate();
    return orders.filter(o => getDateOnly(o.createdAt) === todayDate).length;
  };

  const downloadOrderPDF = (order) => {
    const printWindow = window.open('', '_blank');
    const orderHTML = `
      <html dir="ltr">
      <head>
        <title>فاتورة الطلب</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h2 { text-align: center; }
          .details { margin-top: 20px; }
          .details p { margin: 8px 0; font-size: 18px; }
        </style>
      </head>
      <body>
        <h2>تفاصيل الطلب</h2>
        <div class="details">
          <p><strong>الاسم:</strong> ${order.name}</p>
          <p><strong>الهاتف:</strong> ${order.phone}</p>
          <p><strong>عدد القطع:</strong> ${order.pieces}</p>
          <p><strong>نوع الطلب:</strong> ${order.orderType}</p>
          <p><strong>من:</strong> ${new Date(order.startTime?.seconds * 1000).toLocaleDateString()} الساعة ${getTimeFromDate(order.startTime)}</p>
          <p><strong>إلى:</strong> ${new Date(order.endTime?.seconds * 1000).toLocaleDateString()} الساعة ${getTimeFromDate(order.endTime)}</p>
          <p><strong>الحالة:</strong> ${order.status === 'pending' ? 'قيد الانتظار' : 'تم'}</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(orderHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="admin-dashboard bg-dark text-white min-vh-100">
      {/* Navbar with welcome and logout */}
      <Navbar bg="dark" variant="dark" className="mb-4">

      </Navbar>

      <Container>
        {newPendingCount > 0 && (
          <Alert variant="warning" className="text-center">
            ⚠️ هناك {newPendingCount} طلب قيد الانتظار. الرجاء مراجعتها.
          </Alert>
        )}

        <div className="text-center mb-4">
          <Button variant="outline-light" onClick={fetchOrders}>🔄 تحديث القائمة</Button>
        </div>

        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card bg-secondary text-white">
              <Card.Body>
                <Card.Title>طلبات اليوم</Card.Title>
                <h3>{getTodayOrdersCount()}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              className={`stat-card bg-primary text-white ${filterStatus === null ? 'active-filter' : ''}`}
              onClick={() => setFilterStatus(null)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <Card.Title>إجمالي الطلبات</Card.Title>
                <h3>{orders.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              className={`stat-card bg-success text-white ${filterStatus === 'done' ? 'active-filter' : ''}`}
              onClick={() => setFilterStatus(filterStatus === 'done' ? null : 'done')}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <Card.Title>الطلبات المكتملة</Card.Title>
                <h3>{orders.filter(o => o.status === 'done').length}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      <Row className="mb-4">
  <Col md={6} className="mx-auto">
    <InputGroup className="search-input-group">
      <Form.Control
        type="text"
        placeholder="ابحث برقم الهاتف..."
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
        className="search-input"
      />
      <Button variant="outline-light" onClick={() => setSearchPhone('')} className="search-clear-btn">
        مسح
      </Button>
    </InputGroup>
  </Col>
</Row>


        <h4 className="mb-3">أحدث الطلبات</h4>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Table striped bordered hover responsive className="order-table bg-white text-dark">
              <thead className="table-dark text-center">
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>عدد القطع</th>
                  <th>نوع الطلب</th>
                  <th>من</th>
                  <th>إلى</th>
                  <th>الوقت المتبقي</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">لا توجد طلبات</td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={getRowClass(order.status)}
                      style={{ textAlign: 'center' }}
                    >
                      <td>{index + 1}</td>
                      <td>{order.name}</td>
                      <td>{order.phone}</td>
                      <td>{order.pieces}</td>
                      <td>{order.orderType}</td>
                      <td>{getTimeFromDate(order.startTime)}</td>
                      <td>{getTimeFromDate(order.endTime)}</td>
                      <td>{getTimeRemaining(order.endTime)}</td>
                      <td>
                        <Badge bg={order.status === 'done' ? 'success' : 'warning'}>
                          {order.status === 'done' ? 'تم' : 'قيد الانتظار'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap justify-content-center">
                          <Button
                            variant="info"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                          >
                            عرض
                          </Button>

                          {order.status !== 'done' && (
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2 mb-1"
                              onClick={() => handleStatusUpdate(order.id)}
                            >
                              تم
                            </Button>
                          )}

                          <Button
                            variant="danger"
                            size="sm"
                            className="me-2 mb-1"
                            onClick={() => handleDelete(order.id)}
                          >
                            حذف
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="mb-1 me-3"
                            onClick={() => downloadOrderPDF(order)}
                          >
                            طباعة
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Modal عرض تفاصيل الطلب */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          dir="rtl"
          size="md"
          className="text-dark"
        >
          <Modal.Header closeButton>
            <Modal.Title>تفاصيل الطلب</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder ? (
              <>
                <p><strong>الاسم:</strong> {selectedOrder.name}</p>
                <p><strong>الهاتف:</strong> {selectedOrder.phone}</p>
                <p><strong>عدد القطع:</strong> {selectedOrder.pieces}</p>
                <p><strong>نوع الطلب:</strong> {selectedOrder.orderType}</p>
                <p>
                  <strong>من:</strong> {new Date(selectedOrder.startTime?.seconds * 1000).toLocaleDateString()} الساعة {getTimeFromDate(selectedOrder.startTime)}
                </p>
                <p>
                  <strong>إلى:</strong> {new Date(selectedOrder.endTime?.seconds * 1000).toLocaleDateString()} الساعة {getTimeFromDate(selectedOrder.endTime)}
                </p>
                <p><strong>الحالة:</strong> {selectedOrder.status === 'pending' ? 'قيد الانتظار' : 'تم'}</p>
              </>
            ) : (
              <p>لا توجد تفاصيل للعرض.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>إغلاق</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default AdminDashboard;
