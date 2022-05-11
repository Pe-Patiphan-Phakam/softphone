import React, { useState } from "react";
import {
  Avatar,
  Col,
  Row,
  Button,
  Typography,
  Form,
  Input,
  Card,
  message,
  Upload,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";

const EditProfilePage = () => {
  const { Text } = Typography;
  const [state, setState] = useState({ loading: false });
  const { loading, imageUrl } = state;
  function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  function beforeUpload(file) {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  }

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setState({ loading: true });
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) =>
        setState({
          imageUrl,
          loading: false,
        })
      );
    }
  };

  const uploadButton = (
    <div style={{ position: "relative" }}>
      <Avatar
        style={{ position: "relative" }}
        size={{ xs: 40, sm: 64, md: 64, lg: 80, xl: 100, xxl: 100 }}
      >
        {" "}
      </Avatar>
      <Button
        shape="circle"
        size="small"
        style={{
          bottom: 0,
          right: 0,
          position: "absolute",
          color: "#ffffff",
          backgroundColor: "#F5222D",
        }}
      >
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
      </Button>
    </div>
  );
  return (
    <Card
      title="Edit Profile"
      bordered={false}
      style={{ height: "100%", width: "100%" }}
    >
      <Row align="middle" justify="center">
        <Upload
          name="avatar"
          listType="picture"
          className="avatar-uploader"
          showUploadList={false}
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? (
            <Avatar
              size={{ xs: 40, sm: 64, md: 40, lg: 64, xl: 80, xxl: 100 }}
              src={imageUrl}
            />
          ) : (
            uploadButton
          )}
          <Row>
            <Text type="secondary">Change Picture</Text>
          </Row>
        </Upload>

        <Col span={24}>
          <Form
            name="basic"
            labelCol={{ md: 6, sx: 4 }}
            wrapperCol={{ md: 12, sx: 6 }}
            autoComplete="off"
            style={{ marginTop: "3%" }}
          >
            <Form.Item
              label="Phone Name"
              name="phoneName"
              rules={[{ message: "Please input your Phone Name!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Name"
              name="name"
              rules={[{ message: "Please input your Name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Extension" name="extention">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Username" name="username">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password disabled />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ message: "Please input your Phone Email!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
              <Button htmlType="button" style={{ margin: "0 8px" }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};
export default EditProfilePage;
