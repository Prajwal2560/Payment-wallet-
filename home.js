import { Container, Row, Col, Button, Image } from 'react-bootstrap';
const Home = () => {
  return (
    <div className="bg-light text-center py-5">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <h1 className="display-4">Fast & Secure Online Payments</h1>
            <p className="lead">
              Experience seamless transactions with PayEase. Whether you're a small business or an enterprise, our platform offers the tools you need to manage payments effortlessly.
            </p>
            <ul className="list-unstyled">
              <li>✔️ Easy integration with your website or app</li>
              <li>✔️ Accept payments globally in multiple currencies</li>
              <li>✔️ Real-time transaction monitoring and analytics</li>
            </ul>

          </Col>
          <Col md={6}>
            <Image src="https://via.placeholder.com/500x300" alt="Online payment illustration" fluid />
          </Col>
        </Row>
      </Container>
    </div>
  );
  };
  
  export default Home;
  