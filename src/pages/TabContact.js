import React from "react";
import { Avatar, Col, Row, Button, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const TabContact = () => {
  const { Title, Text } = Typography;
  return (
    <Row align="middle" justify="center" style={{ height: "100%" }}>
      <Col>
      
        <Row align="middle" justify="center">
          <Avatar size={{ xs:70, sm: 100, md: 150, lg: 150, xl: 150, xxl: 150 }} icon={<UserOutlined />} />
        </Row>  
       
        <Row align="middle" justify="center" style={{ marginTop: "10%" }}>
          <Title level={3}>Hard Phone</Title>
        </Row>
        <Row align="middle" justify="center">
          <Text type="secondary">097-456-7894</Text>
        </Row>
        <Row align="middle" justify="center" style={{ marginTop: "10%" }}>
          <Link to="/numpad">
            <Button
              type="primary"
              shape="circle"
              style={{ height: 50, width: 50 }}
            >
              <img
                style={{ height: 20, width: 20 }}
                src="./images/keypad.png"
              />
            </Button>
          </Link>
        </Row>
      </Col>
    </Row>
  );
};
export default TabContact;
