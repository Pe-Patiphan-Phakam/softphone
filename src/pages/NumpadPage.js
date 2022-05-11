import React, { useContext, useState } from "react";
import {
  Card,
  Input,
  Tooltip,
  Button,
  Row,
  Col,
  Avatar,
  Layout,
  notification,
} from "antd";
import Numpad from "../components/Numpad";
import { VideoCameraFilled, PhoneFilled } from "@ant-design/icons";
import { useSimpleUser } from "../context/SimpleUserContext";

import { usePhoneStatus } from "../context/PhoneStatusContext";
import { useContainerLayout } from "../context/VideoContext";
import { useRecentCallList } from "../context/RecentCallListContext";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import AuthContext from "../context/AuthenContext";
import { Inviter, UserAgent } from "sip.js";
import { useConferenceStatus } from "../context/ConferenceStatusContext";
import { useInviterUser } from "../context/InviterUserContext";

const NumpadPage = () => {
  const { Header, Footer, Content } = Layout;
  const { user, setToken } = useContext(AuthContext);
  const [value, setValue] = useState();
  const { simpleUser } = useSimpleUser();
  const { inviterUser } = useInviterUser();
  const { phoneStatus, setPhoneStatus } = usePhoneStatus();
  const { conferenceStatus } = useConferenceStatus();
  const [isCardVisibleCallCreated, setIsCardVisibleCallCreated] =
    useState(false);
  const { recentCallList, setRecentCallList, setFetch, uuid, setUUID } =
    useRecentCallList();
  const [stores, setStores] = useState(null);
  const { videoLayout, setVideoLayout } = useContainerLayout();

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
  const onChange = (_value) => {
    setValue(_value);
  };
  // useEffect(() => {
  //   try {

  //     if (stores === null && recentCallList !== null) {
  //       var tx = recentCallList.transaction("RecentLists", "readwrite");
  //       var store = tx.objectStore("RecentLists");
  //       var index = store.index("NameIndex");
  //       setStores(tx)
  //       // recentCallList.close();
  //     }
  //   } catch (e) {
  //     console.log('Error:', e)
  //   }
  //   // return () => {
  //   //   setStores(null)
  //   // }
  // }, [stores, recentCallList])
  function callToAnother() {
    setPhoneStatus({ created: true, answer: false });
    setVideoLayout(false);
    setIsCardVisibleCallCreated(true);

    const target = UserAgent.makeURI(`sip:${value}@${user?.ipServer}`);
    const inviterOptions = {
      sessionDescriptionHandlerOptions: {
        streams: new MediaStream(),
        constraints: {
          audio: true,
          video: false,
        },
      },
    };
    const inviterInviteOptions = {
      // An example of how to get access to a SIP response message for custom handling
      requestDelegate: {
        onReject: async (response) => {
          var tx = await recentCallList.transaction("RecentLists", "readwrite");
          var store = await tx.objectStore("RecentLists");
          await store.put({
            id: `${uuid}`,
            name: {
              displayName: `${value}`,
              date: dayjs().format(),
              status: "missed",
            },
            target: `${value}`,
          });
          setUUID(uuidv4());
          setFetch(true);
          console.warn(`[${value}] INVITE rejected`);
          notification.error({
            message: `"${value}" ไม่ได้รับสายคุณ\n`,
          });
        },
      },
    };
    const inviter = new Inviter(simpleUser?.userAgent, target, inviterOptions);

    simpleUser
      .sendInvite(inviter, inviterOptions, inviterInviteOptions)
      .then(async () => {
        var tx = await recentCallList.transaction("RecentLists", "readwrite");
        var store = await tx.objectStore("RecentLists");
        await store.put({
          id: `${uuid}`,
          name: {
            displayName: `${value}`,
            date: dayjs().format(),
            status: "call",
          },
          target: `${value}`,
        });
        setFetch(true);
      })
      .catch((error) => {
        setPhoneStatus({ created: false });
        setIsCardVisibleCallCreated(false);
        // localStorage.setItem("phoneStatusCreated",false)
        // console.error(`Failure`, error)
        console.error(`[${value}] ไม่สามารถทำการเชื่อมต่อได้`);
        console.error(error);
        notification.error({
          message: `[${value}] ไม่สามารถทำการเชื่อมต่อได้\n`,
        });
      });
  }
  function callToAnotherVideo() {
    setPhoneStatus({ created: true, answer: false });
    setVideoLayout(true);
    simpleUser
      ?.call(
        `sip:${value}@${user?.ipServer}`,
        {
          sessionDescriptionHandlerOptions: {
            streams: new MediaStream(),
            constraints: {
              audio: true,
              video: true,
            },
          },
        },
        {
          // An example of how to get access to a SIP response message for custom handling
          requestDelegate: {
            onReject: (response) => {
              console.warn(`[${value}] INVITE rejected`);
              notification.error({
                message: `"${value}" ไม่ได้รับสายวีดิโอคอลของคุณ\n`,
              });
            },
          },
        }
      )
      .then(async () => {
        var tx = await recentCallList.transaction("RecentLists", "readwrite");
        var store = await tx.objectStore("RecentLists");
        await store.put({
          id: `${uuid}`,
          name: {
            displayName: `${value}`,
            date: dayjs().format(),
            status: "call",
          },
          target: `${value}`,
        });
        setFetch(true);
        // alert("call success")
      })
      .catch((error) => {
        setPhoneStatus({ created: false });
      });
  }
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <Layout style={{ backgroundColor: "transparent", height: "100%" }}>
      <Header style={{ backgroundColor: "transparent", height: "5%" }}></Header>
      <Content>
        <Row align="middle" justify="center">
          <Col>
            <Avatar
              style={{ backgroundColor: "#096DD9" }}
              size={{ xs: 70, sm: 100, md: 150, lg: 150, xl: 150, xxl: 150 }}
              {...stringAvatar(`${user?.username}`)}
            />
          </Col>
        </Row>
        <Row align="middle" justify="center">
          <Col>
            <Input
              onChange={handleChange}
              onPressEnter={callToAnother}
              placeholder="Tel."
              value={value}
              style={{ marginTop: "10%" }}
            />
          </Col>
        </Row>

        <Row align="middle" justify="center">
          <Col style={{ marginTop: "2%", paddingRight: "2%" }}>
            <Tooltip title="Video Call">
              <Button
                type="primary"
                onClick={callToAnotherVideo}
                shape="circle"
                icon={<VideoCameraFilled />}
                size="large"
                disabled={
                  simpleUser?.session
                    ? true
                    : false || inviterUser?.session
                    ? true
                    : false
                }
              />
            </Tooltip>
          </Col>
          <Col style={{ marginTop: "2%", paddingLeft: "2%" }}>
            <Tooltip title="Call">
              <Button
                type="primary"
                shape="circle"
                onClick={callToAnother}
                icon={<PhoneFilled />}
                size="large"
                disabled={
                  simpleUser?.session
                    ? true
                    : false || inviterUser?.session
                    ? true
                    : false
                }
              />
            </Tooltip>
          </Col>
        </Row>
      </Content>
      <Footer style={{ padding: "0%", bottom: 0, height: "45%" }}>
        <Row style={{ width: "100%" }} align="bottom">
          <Col span={24}>
            <Card
              style={{
                width: "100%",
                paddingBottom: "0%",
                bottom: 0,
                backgroundColor: "#D1D5DB",
                zIndex: 0,
              }}
            >
              <Numpad onChange={onChange} />
            </Card>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
};
export default NumpadPage;
