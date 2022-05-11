import React, { Fragment, useState, useContext } from "react";
import "../App.css";
import {
  Card,
  Avatar,
  List,
  Tooltip,
  Divider,
  notification,
  Button,
  Row,
  Col,
  Collapse,
} from "antd";
import { VideoCameraFilled, PhoneFilled } from "@ant-design/icons";
import {
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
  MinusCircle,
} from "react-feather";
import { useSimpleUser } from "../context/SimpleUserContext";
import { v4 as uuidv4 } from "uuid";
// import { Link } from "react-router-dom";
import { useRecentCallList } from "../context/RecentCallListContext";
import dayjs from "dayjs";
// import { icons } from "antd/lib/image/PreviewGroup";
// import { IconMap } from "antd/lib/result";
import AuthContext from "../context/AuthenContext";
import { usePhoneStatus } from "../context/PhoneStatusContext";
import { useContainerLayout } from "../context/VideoContext";
import { useInviterUser } from "../context/InviterUserContext";
// var utc = require('dayjs/plugin/utc')
// var timezone = require('dayjs/plugin/timezone')
// dayjs.extend(utc)
// dayjs.extend(timezone)
// dayjs.tz.setDefault("Asia/Bangkok");
require("dayjs/locale/th");
var localizedFormat = require("dayjs/plugin/localizedFormat");
var isYesterday = require("dayjs/plugin/isYesterday");
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);
const Recents = ({ result, data, recentCallList, setFetch }) => {
  const { videoLayout, setVideoLayout } = useContainerLayout();
  const { setPhoneStatus } = usePhoneStatus();
  const { uuid, setUUID } = useRecentCallList();
  const { user } = useContext(AuthContext);
  const { simpleUser } = useSimpleUser();
  const { inviterUser } = useInviterUser();
  const { Panel } = Collapse;
  const showIcon = (status) => {
    switch (status) {
      case "call":
        return <PhoneOutgoing size={22} style={{ color: "green" }} />;
      case "recived":
        return <PhoneIncoming size={22} style={{ color: "green" }} />;
      case "missed":
        return <PhoneMissed size={22} style={{ color: "red" }} />;

      default:
        return null;
    }
  };
  const handleDelete = async (id) => {
    try {
      var tx = await recentCallList.transaction("RecentLists", "readwrite");
      await tx.objectStore("RecentLists").delete(id);
      tx.oncomplete = function () {
        setFetch(true);
        notification.success({
          message: "ลบประวัติเรียบร้อย",
        });
      };
    } catch (e) {
      console.log("Error", e);
    }
  };
  function callToReceive(displayName) {
    setPhoneStatus({ created: true, answer: false });
    setVideoLayout(false);
    simpleUser
      ?.call(
        `sip:${displayName}@${user?.ipServer}`,
        {
          sessionDescriptionHandlerOptions: {
            streams: new MediaStream(),
            constraints: {
              audio: true,
              video: false,
            },
          },
        },
        {
          // An example of how to get access to a SIP response message for custom handling
          requestDelegate: {
            onReject: async (response) => {
              var tx = await recentCallList.transaction(
                "RecentLists",
                "readwrite"
              );
              var store = await tx.objectStore("RecentLists");
              await store.put({
                id: `${uuid}`,
                name: {
                  displayName: `${displayName}`,
                  date: dayjs().format(),
                  status: "missed",
                },
                target: `${displayName}`,
              });
              setUUID(uuidv4());
              setFetch(true);
              console.warn(`[${displayName}] INVITE rejected`);
              notification.error({
                message: `"${displayName}" ไม่ได้รับสายคุณ\n`,
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
            displayName: `${displayName}`,
            date: dayjs().format(),
            status: "call",
          },
          target: `${displayName}`,
        });
        setFetch(true);
      })
      .catch((error) => {
        setPhoneStatus({ created: false });

        console.error(`[${displayName}] ไม่สามารถทำการเชื่อมต่อได้`);
        console.error(error);
        notification.error({
          message: `[${displayName}] ไม่สามารถทำการเชื่อมต่อได้\n`,
        });
      });
  }
  function callToVideoReceive(displayName) {
    setPhoneStatus({ created: true, answer: false });
    setVideoLayout(true);

    simpleUser
      ?.call(
        `sip:${displayName}@${user?.ipServer}`,
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
              console.warn(`[${displayName}] INVITE rejected`);
              notification.error({
                message: `"${displayName}" ไม่ได้รับสายวีดิโอคอลของคุณ\n`,
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
            displayName: `${displayName}`,
            date: dayjs().format(),
            status: "call",
          },
          target: `${displayName}`,
        });
        setFetch(true);
      })
      .catch((error) => {
        setPhoneStatus({ created: false });
      });
  }

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
  // console.log("recents", recentCallList);
  return (
    <Card
      title="Recents"
      bodyStyle={{ padding: "2%" }}
      headStyle={{ borderBottom: 0 }}
      style={{
        marginTop: "3%",
        width: "100%",
      }}
      bordered={false}
    >
      <List
        style={{
          maxHeight: "350px",
          overflowY: "auto",
        }}
        itemLayout="vertical"
        dataSource={data}
        renderItem={(item) => (
          <Fragment>
            <Divider style={{ fontSize: "14px" }}>today</Divider>
            {result
              ?.filter((rowa) => {
                return dayjs().isSame(rowa?.name?.date, "day");
              })
              .map((row) => {
                return (
                  <List.Item style={{ width: "100%" }}>
                    <Row>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            {...stringAvatar(`${row?.name?.displayName}`)}
                          />
                        }
                        title={row?.name?.displayName}
                        description={dayjs(`${row?.name?.date}`)
                          .locale("th")
                          .format("dddd, HH:mm")}
                      />
                      {showIcon(row?.name?.status)}
                      <Tooltip title={"ลบประวัติการโทร"}>
                        <MinusCircle
                          style={{
                            marginLeft: "5px",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(row?.id);
                          }}
                        />
                      </Tooltip>
                    </Row>
                    <Collapse
                      bordered={false}
                      expandIconPosition="right"
                      style={{
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <Panel
                        className="ant-collapse"
                        color="#ffffff"
                        key="1"
                        style={{
                          color: "#ffffff",
                          borderBottom: "0px solid #ffffff",
                          padding: "0%",
                        }}
                      >
                        <Row justify="space-around" align="middle">
                          <Col></Col>
                          <Col>
                            <Tooltip title="Video Call">
                              <Button
                                type="primary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  callToVideoReceive(row?.name?.displayName);
                                }}
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
                          <Col>
                            <Tooltip title="Call">
                              <Button
                                type="primary"
                                shape="circle"
                                onClick={(e) => {
                                  e.preventDefault();
                                  callToReceive(row?.name?.displayName);
                                }}
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
                          <Col></Col>
                        </Row>
                      </Panel>
                    </Collapse>
                  </List.Item>
                );
              })}
            <Divider style={{ fontSize: "14px" }}>yesterday</Divider>
            {result
              ?.filter((rowa) => {
                // console.log(
                //   "aaaaaaa",
                //   dayjs(
                //     `${dayjs(rowa?.name?.date).format(
                //       "YYYY-MM-DDTHH:mm:ssZ[Z]"
                //     )}`
                //   ).isYesterday()
                // );
                // console.log(
                //   "aaaaaaa",
                //   `${dayjs(rowa?.name?.date).format("YYYY-MM-DDTHH:mm:ssZ[Z]")}`
                // );
                return dayjs(rowa?.name?.date).isYesterday();
              })
              .map((row) => {
                return (
                  <List.Item style={{ width: "100%" }}>
                    <Row>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            {...stringAvatar(`${row?.name?.displayName}`)}
                          />
                        }
                        title={row?.name?.displayName}
                        description={dayjs(`${row?.name?.date}`)
                          .locale("th")
                          .format("dddd, HH:mm")}
                      />

                      {showIcon(row?.name?.status)}
                      <Tooltip title={"ลบประวัติการโทร"}>
                        <MinusCircle
                          style={{
                            marginLeft: "5px",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(row?.id);
                          }}
                        />
                      </Tooltip>
                    </Row>
                    <Collapse
                      bordered={false}
                      expandIconPosition="right"
                      style={{
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <Panel
                        className="ant-collapse"
                        color="#ffffff"
                        key="1"
                        style={{
                          color: "#ffffff",
                          borderBottom: "0px solid #ffffff",
                          padding: "0%",
                        }}
                      >
                        <Row justify="space-around" align="middle">
                          <Col></Col>
                          <Col>
                            <Tooltip title="Video Call">
                              <Button
                                type="primary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  callToVideoReceive(row?.name?.displayName);
                                }}
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
                          <Col>
                            <Tooltip title="Call">
                              <Button
                                type="primary"
                                shape="circle"
                                onClick={(e) => {
                                  e.preventDefault();
                                  callToReceive(row?.name?.displayName);
                                }}
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
                          <Col></Col>
                        </Row>
                      </Panel>
                    </Collapse>
                  </List.Item>
                );
              })}
            <Divider style={{ fontSize: "14px" }}>older</Divider>
            {result
              ?.filter((rowa) => {
                return (
                  !dayjs().isSame(rowa?.name?.date, "day") &&
                  !dayjs(rowa?.name?.date).isYesterday()
                );
              })
              .map((row) => {
                return (
                  <List.Item style={{ width: "100%" }}>
                    <Row>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            {...stringAvatar(`${row?.name?.displayName}`)}
                          />
                        }
                        title={row?.name?.displayName}
                        description={dayjs(`${row?.name?.date}`)
                          .locale("th")
                          .format("dddd, HH:mm")}
                      />
                      {showIcon(row?.name?.status)}
                      <Tooltip title={"ลบประวัติการโทร"}>
                        <MinusCircle
                          style={{
                            marginLeft: "5px",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(row?.id);
                          }}
                        />
                      </Tooltip>
                    </Row>
                    <Collapse
                      bordered={false}
                      expandIconPosition="right"
                      style={{
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <Panel
                        className="ant-collapse"
                        color="#ffffff"
                        key="1"
                        style={{
                          color: "#ffffff",
                          borderBottom: "0px solid #ffffff",
                          padding: "0%",
                        }}
                      >
                        <Row justify="space-around" align="middle">
                          <Col></Col>
                          <Col>
                            <Tooltip title="Video Call">
                              <Button
                                type="primary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  callToVideoReceive(row?.name?.displayName);
                                }}
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
                          <Col>
                            <Tooltip title="Call">
                              <Button
                                type="primary"
                                shape="circle"
                                onClick={(e) => {
                                  e.preventDefault();
                                  callToReceive(row?.name?.displayName);
                                }}
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
                          <Col></Col>
                        </Row>
                      </Panel>
                    </Collapse>
                  </List.Item>
                );
              })}
          </Fragment>
        )}
      />
    </Card>
  );
};
export default Recents;
