import React, { useEffect, useState, useContext } from "react";
// import "antd/dist/antd.css";
// import "../index.css"
import { URI, Web } from "sip.js";

import { UserOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Col,
  Row,
  Typography,
  Layout,
  Image,
  notification,
} from "antd";
import { useSimpleUser } from "../context/SimpleUserContext";
import { useHistory } from "react-router";
// import { useMultiState } from "../lib/hook";
import { jwtSign } from "../lib/jwtSign";
import AuthContext from "../context/AuthenContext";
import { getVideo } from "../components/media";
import { useRecentCallList } from "../context/RecentCallListContext";
import { UserAgentCustom } from "../lib/userAgentFunc";
import { useInviterUser } from "../context/InviterUserContext";

const LoginPage = () => {
  const { Header, Footer, Content } = Layout;
  const history = useHistory();
  const [valueData, setValueData] = useState({});
  const [loginStatus, setLoginStatus] = useState(false);
  // const [rejectStatus, setRejectStatus] = useState("1");
  const { simpleUser, setSimpleUser } = useSimpleUser();
  const { setInviterUser } = useInviterUser();
  // const [username, setUserName] = useState("");
  // const [password, setPassWord] = useState("");

  const { setFetch } = useRecentCallList();
  // const [registerstatus, setNoneUser] = useState(false);
  const { Title, Text } = Typography;

  const checkWss = process.env.REACT_APP_WSS;

  const { user, setToken } = useContext(AuthContext);

  // const loadAudioElement = () => {
  //   return new Promise((resolve) => {
  //     const audio = document.createElement("audio");
  //     audio.id = "remote_audio";
  //     audio.autoplay = true;
  //     resolve(audio);
  //     document.body.appendChild(audio);
  //   });
  // };

  // const loadVideoRemote = () => {
  //   return new Promise((resolve) => {
  //     const video = document.createElement("video");
  //     video.id = "remote_video";
  //     video.autoplay = true;
  //     resolve(video);
  //     document.body.appendChild(video);
  //   });
  // };

  // const loadVideoLocal = () => {
  //   return new Promise((resolve) => {
  //     const video = document.createElement("video");
  //     video.id = "Local_video";
  //     video.autoplay = true;
  //     resolve(video);
  //     document.body.appendChild(video);
  //   });
  // };

  localStorage.setItem("registerstatus", "none");

  const onFinish = async (values) => {
    try {
      const server =
        checkWss === "true"
          ? values?.socketServer
          : process.env.REACT_APP_PROTOCOL;
      const ipServer =
        checkWss === "true"
          ? `${values?.socketServer}`.match(
              /[\w-\.]+.([\w-]+\.)+[\w-]{2,4}/g
            )[0]
          : process.env.REACT_APP_IP_SERVER;
      localStorage.setItem("registerstatus", "register");

      let token = "";
      const audioEle = await getVideo("remote_audio_softphone");
      const videoRemote = await getVideo("remote_video_softphone");
      const videoLocal = await getVideo("local_video_softphone");
      const options = {
        aor: `sip:${values?.username}@${ipServer}`,
        media: {
          constraints: { audio: true, video: true },
          remote: { audio: audioEle, video: videoRemote },
          local: { video: videoLocal },
        },
        userAgentOptions: {
          authorizationUsername: values?.username,
          authorizationPassword: values?.password,
          wsServers: server,
          uri: new URI("sip", values?.username, ipServer),
          displayName: values?.username,
        },
      };
      // const userAgent1 = new UserAgentCustom(server, options);
      const simple1 = new Web.SimpleUser(server, options);

      // await userAgent1.connect();
      await simple1.connect();

      await simple1
        .register(
          { expires: 3600 },
          {
            // An example of how to get access to a SIP response message for custom handling
            requestDelegate: {
              onReject: async (response) => {
                notification.error({
                  message: `การเข้าสู่ระบบด้วยหมายเลข "${values?.username}" ถูกปฏิเสธ.\n`,
                });
              },
            },
          }
        )
        .then(async (e) => {
          await setSimpleUser(simple1);
          setValueData({
            username: values?.username,
            password: values?.password,
            ipServer: ipServer,
            socketServer: server,
          });
        })
        .catch((err) => {
          notification.error({
            message: "ผิดพลาด",
          });
        });
      // await userAgent1
      // .register(
      //   { expires: 3600 },
      //   {
      //     // An example of how to get access to a SIP response message for custom handling
      //     requestDelegate: {
      //       onReject: async (response) => {
      //         notification.error({
      //           message: `การเข้าสู่ระบบด้วยหมายเลข "${values?.username}" ถูกปฏิเสธ.\n`,
      //         });
      //       },
      //     },
      //   }
      // )
      // .then(async () => {
      //   await setInviterUser(userAgent1);
      // });

      localStorage.setItem("login", true);
    } catch (e) {
      console.log(e);
      notification.error({
        message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
      });
    } finally {
      setLoginStatus(true);
    }
  };

  if (simpleUser !== null) {
    simpleUser.delegate = {
      onRegistered: async (e) => {
        const token = await jwtSign(
          {
            username: valueData?.username,
            password: valueData?.password,
            ipServer: valueData?.ipServer,
            socketServer: valueData?.socketServer,
          },
          "1d"
        );
        setToken(token);
      },
    };
  }

  useEffect(() => {
    if (user) {
      setFetch(true);
      history.push("/taball");
    }
    return () => {};
  }, [user, history, setFetch]);

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: "100vh",
        width: "100vw",
        backgroundImage: "url(/images/BGLogin.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Col md={14} xs={24}>
        <Layout
          style={{
            height: "100vh",
            width: "100%",
            alignItems: "center",
            justifyItems: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <Header
            style={{
              height: "15vh",
              width: "100%",
              backgroundColor: "#ffffff",
            }}
          >
            <Row align="bottom" style={{ height: "15vh", width: "100%" }}>
              <Title style={{ color: "#1890FF" }}>SoftPhone</Title>
            </Row>
          </Header>
          <Content
            style={{
              height: "75vh",
              width: "100%",
              padding: "50px 100px 50px 100px",
              backgroundColor: "#ffffff",
            }}
          >
            <Title style={{ color: "#096DD9" }}>WELCOME!</Title>
            <Typography>Please login to your account</Typography>

            <Form
              size="large"
              style={{ width: "100%", marginTop: "5%" }}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              name="normal_login"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              autoComplete="off"
            >
              {checkWss === "true" ? (
                <Form.Item
                  name="socketServer"
                  rules={[
                    {
                      required: true,
                      message: "Please input Socket Server!",
                    },
                  ]}
                >
                  <Input
                    prefix={<GlobalOutlined style={{ color: "#1890FF" }} />}
                    placeholder="Socket Server"
                  />
                </Form.Item>
              ) : null}
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your Username!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#1890FF" }} />}
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your Password!",
                  },
                ]}
              >
                <Input
                  prefix={<LockOutlined style={{ color: "#1890FF" }} />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>

              {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item> */}

              <Form.Item>
                <Button
                  style={{ marginTop: "8%" }}
                  type="primary"
                  htmlType="submit"
                  block
                >
                  Sign in
                </Button>
              </Form.Item>
            </Form>
          </Content>

          <Footer style={{ height: "10vh", backgroundColor: "#ffffff" }}>
            <div>
              <Text>OSD Limited Company</Text>
            </div>
          </Footer>
        </Layout>
      </Col>

      <Col
        style={{
          backgroundImage: "url(/images/BGLogin.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "100vh",
          width: "100vw",
        }}
        md={10}
        xs={0}
        span={10}
      >
        <Row justify="center" align="middle" style={{ height: "100%" }}>
          <Col>
            <Image preview={false} src="./images/OSD.png" />
          </Col>
          <div
            style={{
              position: "absolute",
              bottom: "0px",
              right: "0px",
            }}
          >
            <Text style={{ color: "#ffffff", opacity: "0.5" }}>
              Version 0.1.8
            </Text>
          </div>
        </Row>
      </Col>
    </Row>
  );
};

export default LoginPage;
