import React, { useContext } from "react";
import { Avatar, Col, Row, Button, Typography, Tooltip } from "antd";
// import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "../App.css";
import AuthContext from "../context/AuthenContext";

const TabAll = () => {
  const { Title } = Typography;
  const { user } = useContext(AuthContext);
  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }
  function stringAvatar(name) {
    return {
      style: {
        backgroundColor: stringToColor(name),
      },
      children: `${name?.split(" ")[0][0]}`,
    };
  }
  return (
    <Row align="middle" justify="center" style={{ height: "100%" }}>
      <Col>
        <Row align="middle" justify="center">
          <Avatar
            style={{ backgroundColor: "#096DD9" }}
            {...stringAvatar(`${user?.username}`)}
            size={{ xs: 70, sm: 100, md: 150, lg: 150, xl: 150, xxl: 150 }}
          />
        </Row>
        <Row align="middle" justify="center" style={{ marginTop: "10%" }}>
          <Title level={3}>{user?.username}</Title>
        </Row>
        <Row align="middle" justify="center">
          {/* <Text type="secondary">097-456-7894</Text> */}
        </Row>
        <Row align="middle" justify="center" style={{ marginTop: "10%" }}>
          <Link to="/numpad">
            <Tooltip title="NumPad">
              <Button
                type="primary"
                shape="circle"
                style={{ height: 50, width: 50 }}
              >
                <img
                  style={{ height: 20, width: 20 }}
                  src="/images/keypad.png"
                />
              </Button>
            </Tooltip>{" "}
          </Link>
        </Row>
      </Col>
    </Row>
  );
};
export default TabAll;
