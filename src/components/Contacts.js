import React, { useState } from "react";
import {
  Card,
  Avatar,
  List,
  Menu,
  message,
  Button,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";

// import { Link } from "react-router-dom";
import Checkbox from "antd/lib/checkbox/Checkbox";
import "../App.css";

const Contacts = () => {
  const data = [
    {
      title: "Hard Phone",
    },
  ];

  const [checkEdit, setCheckEdit] = useState(false);
  const [checkDelete, setCheckDelete] = useState(false);

  const handleEdit = () => {
    setCheckEdit(true);
  };
  const handleDelete = () => {
    setCheckDelete(true);
  };
  const cancelDelete = () => {
    setCheckDelete(false);
  };
  function confirm(e) {
    // console.log(e);
    message.success("Deleted");
  }

  function cancel(e) {
    // console.log(e);
    message.error("Cancel");
  }

  function handleMenuClick(e) {
    message.info("Click on menu item.");
    // console.log("click", e);
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item onClick={handleEdit} key="1" icon={<UserOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="2" onClick={handleDelete} icon={<UserOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  return (
    <Card
      title="Contacts"
      bodyStyle={{ padding: "2%" }}
      // extra={[
      //   <Link to="/addcontactpage">
      //     <UserAddOutlined style={{ fontSize: "18px" }} />
      //   </Link>,
      //   <Dropdown overlay={menu} placement="bottomLeft">
      //     <Button type="link" shape="circle" icon={<EllipsisOutlined />} />
      //   </Dropdown>,
      // ]}
      style={{ marginTop: "3%", width: "100%" }}
      bordered={false}
    >
      <List
        value
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) =>
          checkEdit == true ? (
            <div className="List-hov">
              {/* <Link to="/editcontactpage"> */}
              {/* onClick={handleEdit} */}
              <List.Item style={{ width: "97%" }}>
                <Popconfirm
                  title="Are you sure to delete this contact?"
                  onConfirm={confirm}
                  onCancel={cancel}
                  okText="Yes"
                  cancelText="No"
                >
                  <Checkbox
                    style={{ display: checkDelete == true ? "flex" : "none" }}
                  />
                </Popconfirm>
                <List.Item.Meta
                  avatar={<Avatar />}
                  title={<a>{item.title}</a>}
                  description="099-2544459"
                />
              </List.Item>
              {/* </Link> */}
            </div>
          ) : (
            <div className="List-hov">
              {/* <Link to="/tabcontact"> */}
              <List.Item style={{ width: "97%" }}>
                <Popconfirm
                  title="Are you sure to delete this task?"
                  onConfirm={confirm}
                  onCancel={cancel}
                  okText="Yes"
                  cancelText="No"
                >
                  <Checkbox
                    style={{
                      display: checkDelete == true ? "flex" : "none",
                      padding: "0px 10px 0px 0px",
                    }}
                  />
                </Popconfirm>
                <List.Item.Meta
                  avatar={<Avatar />}
                  title={<a>{item.title}</a>}
                  description="099-2544459"
                />
              </List.Item>
              {/* </Link> */}
            </div>
          )
        }
      />
      <Button
        onClick={cancelDelete}
        type="primary"
        style={{
          display: checkDelete == true ? "inline-block" : "none",
          alignContent: "center",
        }}
        block
        danger
      >
        Cancel
      </Button>
    </Card>
  );
};
export default Contacts;
