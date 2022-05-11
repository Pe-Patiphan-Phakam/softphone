import React, { useCallback, useContext, useEffect, useState } from "react";
import { Col, Layout, Row, Collapse, notification } from "antd";
import { Inviter, SessionState, URI, UserAgent, Web } from "sip.js";

import SiderBar from "./SiderBar";
import DetailBar from "./DetailBar";
import { useSimpleUser } from "../context/SimpleUserContext";
import CardPhone from "./CardPhone";
import CardPhoneCallCreated from "./CardPhoneCallCreated";

import { useHistory } from "react-router";

// import Video from "../components/Video";
import { usePhoneStatus } from "../context/PhoneStatusContext";
import ToolBar from "./ToolBar";
// import {
//   MenuUnfoldOutlined,
//   MenuFoldOutlined,
//   UpOutlined,
//   DownOutlined,
// } from "@ant-design/icons";
import AuthContext from "../context/AuthenContext";

import useSound from "use-sound";
import RingtoneCall from "../sounds/SoundCall.mp3";
import RingtoneReceive from "../sounds/SoundCall.mp3";
import { getVideo } from "./media";

import { useRecentCallList } from "../context/RecentCallListContext";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { useContainerLayout } from "../context/VideoContext";
import { useInterval } from "../lib/hook";
import { useInviterUser } from "../context/InviterUserContext";
import CardPhoneConference from "./CardPhoneConference";
import { UserAgentCustom } from "../lib/userAgentFunc";
import { useConferenceStatus } from "../context/ConferenceStatusContext";

const LayoutLanding = (props) => {
  const STATUS = {
    STARTED: "Started",
    STOPPED: "Stopped",
  };
  const INITIAL_COUNT = 0;
  const [secondsRemaining, setSecondsRemaining] = useState(INITIAL_COUNT);
  const [secondsConferenceRemaining, setSecondsConferenceRemaining] =
    useState(INITIAL_COUNT);

  const [play, { stop }] = useSound(
    RingtoneCall,
    {
      onend: async () => {
        stop();
      },
    },
    RingtoneReceive,
    {
      onend: () => {
        stop();
      },
    }
  );

  // const { Panel } = Collapse;
  const { user, setToken } = useContext(AuthContext);
  const { simpleUser, setSimpleUser } = useSimpleUser();
  const { inviterUser } = useInviterUser();
  const { Header, Content, Sider } = Layout;
  const [isCardVisible, setIsCardVisible] = useState(false);
  // const [showVideo, setShowVideo] = useState(false);
  const { phoneStatus, setPhoneStatus } = usePhoneStatus();
  const { conferenceStatus, setConferenceStatus } = useConferenceStatus();
  const { recentCallList, setRecentCallList, setFetch, uuid, setUUID } =
    useRecentCallList();
  const [stores, setStores] = useState(null);
  const [isCardPhoneConference, setIsCardPhoneConference] = useState(false);
  const [isCardVisibleCallCreated, setIsCardVisibleCallCreated] =
    useState(false);
  const [timeStatus, setTimeStatus] = useState(STATUS.STOPPED);
  const [timeConferenceStatus, setTimeConferenceStatus] = useState(
    STATUS.STOPPED
  );
  const history = useHistory();
  const { videoLayout, setVideoLayout } = useContainerLayout();
  const [collapse, setCollapse] = useState({
    collapsed: false,
  });
  // const { collapsed } = collapse;

  const { setInviterUser } = useInviterUser();

  var mediaElement = document.getElementById("remote_audio_softphone");
  const remoteStream = new MediaStream();
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
  const server = user?.socketServer;

  useEffect(() => {
    if (stores === null && recentCallList !== null) {
      var tx = recentCallList.transaction("RecentLists", "readwrite");
      var store = tx.objectStore("RecentLists");
      var index = store.index("NameIndex");

      setStores(store);
      // recentCallList.close();
    }
    // return () => {
    //   setStores(null)
    // }
  }, [stores, recentCallList]);

  useEffect(async () => {
    if (simpleUser) {
      history.push("/taball");
    }
    if (user) {
      if (user.exp > Math.round(new Date().getTime() / 1000)) {
        if (!simpleUser?.isConnected()) {
          const audioEle = await getVideo("remote_audio_softphone");
          const videoRemote = await getVideo("remote_video_softphone");
          const videoLocal = await getVideo("local_video_softphone");
          const options = {
            aor: `sip:${user?.username}@${user?.ipServer}`,
            media: {
              constraints: { audio: true, video: true },
              remote: { audio: audioEle, video: videoRemote },
              local: { video: videoLocal },
            },
            userAgentOptions: {
              authorizationUsername: user?.username,
              authorizationPassword: user?.password,
              wsServers: server,
              uri: new URI("sip", user?.username, user?.ipServer),
              displayName: user?.username,
            },
          };

          const simple1 = new Web.SimpleUser(server, options);
          const userAgent1 = new UserAgentCustom(server, options);

          await userAgent1.connect();
          await userAgent1
            .register(
              { expires: 3600 },
              {
                // An example of how to get access to a SIP response message for custom handling
                requestDelegate: {
                  onReject: async (response) => {
                    notification.error({
                      message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
                    });
                  },
                },
              }
            )
            .then(async () => {
              await setInviterUser(userAgent1);
            });
          simple1.connect().then(() => {
            simple1
              .register(
                { expires: 3600 },
                {
                  // An example of how to get access to a SIP response message for custom handling
                  requestDelegate: {
                    onReject: async (response) => {
                      notification.error({
                        message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
                      });
                    },
                  },
                }
              )
              .then(async (e) => {
                await setSimpleUser(simple1);
                setUUID(uuidv4());
                handleCancel();
                handleCancelCallCreated();
                setPhoneStatus({ created: false, answer: false, mute: false });

                stop();
              })
              .catch((err) => {
                console.error("error", err);
                notification.error({
                  message: "ผิดพลาด",
                });
              });
          });
        }
      }
    }
  }, [simpleUser, history, user]);

  useInterval(async () => {
    try {
      const audioEle = await getVideo("remote_audio_softphone");
      const videoRemote = await getVideo("remote_video_softphone");
      const videoLocal = await getVideo("local_video_softphone");
      const options = {
        aor: `sip:${user?.username}@${user?.ipServer}`,
        media: {
          constraints: { audio: true, video: true },
          remote: { audio: audioEle, video: videoRemote },
          local: { video: videoLocal },
        },
        userAgentOptions: {
          authorizationUsername: user?.username,
          authorizationPassword: user?.password,
          wsServers: server,
          uri: new URI("sip", user?.username, user?.ipServer),
          displayName: user?.username,
        },
      };

      const simple1 = new Web.SimpleUser(server, options);
      // const userAgent1 = new UserAgentCustom(server, options);
      // await userAgent1.connect();
      // await userAgent1
      //   .register(
      //     { expires: 3600 },
      //     {
      //       requestDelegate: {
      //         onReject: async (response) => {
      //           notification.error({
      //             message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
      //           });
      //         },
      //       },
      //     }
      //   )
      //   .then(async () => {
      //     await setInviterUser(userAgent1);
      //   });
      simple1.connect().then(() => {
        simple1
          .register(
            { expires: 3600 },
            {
              // An example of how to get access to a SIP response message for custom handling
              requestDelegate: {
                onReject: async (response) => {
                  notification.error({
                    message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
                  });
                },
              },
            }
          )
          .then(async (e) => {
            await setSimpleUser(simple1);
            setUUID(uuidv4());
            handleCancel();
            handleCancelCallCreated();
            setPhoneStatus({ created: false, answer: false, mute: false });

            stop();
          })
          .catch((err) => {
            console.error("error", err);
            notification.error({
              message: "ผิดพลาด",
            });
          });
      });
    } catch (e) {
      console.log("Error", e);
    }
  }, 3600000);

  const showCard = () => {
    setIsCardVisible(true);
  };
  const showCardCallCreated = () => {
    setIsCardVisibleCallCreated(true);
  };

  const handleCancel = () => {
    setIsCardVisible(false);
  };
  const handleCancelCallCreated = () => {
    setIsCardVisibleCallCreated(false);
  };

  function setupRemoteMedia(sessionSimple) {
    var receivedTracks = [];
    [sessionSimple, simpleUser?.session].forEach(function (session) {
      if (session !== null && session !== undefined) {
        session?.sessionDescriptionHandler?.peerConnection
          .getReceivers()
          .forEach(function (receiver) {
            receivedTracks.push(receiver.track);
          });
      }
    });

    //use the Web Audio API to mix the received tracks
    var context = new AudioContext();
    var allReceivedMediaStreams = new MediaStream();

    [sessionSimple, simpleUser?.session].forEach(function (session) {
      if (session !== null && session !== undefined) {
        var mixedOutput = context.createMediaStreamDestination();

        session?.sessionDescriptionHandler?.peerConnection
          .getReceivers()
          .forEach(function (receiver) {
            receivedTracks.forEach(function (track) {
              allReceivedMediaStreams.addTrack(receiver.track);
              if (receiver.track.id !== track.id) {
                var sourceStream = context.createMediaStreamSource(
                  new MediaStream([track])
                );
                sourceStream.connect(mixedOutput);
              }
            });
          });
        //mixing your voice with all the received audio
        session?.sessionDescriptionHandler?.peerConnection
          .getSenders()
          .forEach(function (sender) {
            var sourceStream = context.createMediaStreamSource(
              new MediaStream([sender.track])
            );
            // allReceivedMediaStreams.addTrack(sender.track);
            sourceStream.connect(mixedOutput);
          });
        session?.sessionDescriptionHandler?.peerConnection
          .getSenders()[0]
          .replaceTrack(mixedOutput.stream.getTracks()[0]);
      }
    });

    //play all received stream to you
    mediaElement.srcObject = allReceivedMediaStreams;
    var promiseRemote = mediaElement.play();
    if (promiseRemote !== undefined) {
      promiseRemote
        .then((_) => {
          // console.log("playing all received streams to you kkk");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  function setupRemoteMediaSimpleUser(session) {
    session.sessionDescriptionHandler.peerConnection
      .getReceivers()
      .forEach((receiver) => {
        if (receiver.track) {
          remoteStream.addTrack(receiver.track);
        }
      });
    mediaElement.srcObject = remoteStream;
    mediaElement.play();
  }

  // function setupRemoteInviterMedia(session) {
  //   session?.sessionDescriptionHandler?.peerConnection
  //     .getReceivers()
  //     .forEach((receiver) => {
  //       if (receiver.track) {
  //         // remoteStream.addTrack(receiver.track);
  //         session.sessionDescriptionHandler.peerConnection.addTrack(receiver.track)
  //       }
  //     });
  //   // mediaElement.srcObject = remoteStream;
  //   // mediaElement.play();

  // }
  function cleanupMedia() {
    mediaElement.srcObject = null;
    mediaElement.pause();
  }
  const isCardPhoneConferenceShow = useCallback(() => {
    setIsCardPhoneConference(true);
  }, []);
  // const inAcceptFucn = useCallback(() => { console.log('kkk INAccept'); }, [])
  if (inviterUser !== null) {
    inviterUser.delegate = {
      onCallAnswered: async (e) => {
        setConferenceStatus({ answer: true });
        stop();
        setupRemoteMedia(inviterUser?.session);
        // setTimeConferenceStatus(STATUS.STOPPED);
        // setSecondsConferenceRemaining(INITIAL_COUNT);
        // setTimeConferenceStatus(STATUS.STARTED);
      },
      onCallCreated: async (e) => {
        if (conferenceStatus.created !== true) {
          // addData('call')
          setTimeConferenceStatus(STATUS.STARTED);
          isCardPhoneConferenceShow();
          play({ RingtoneCall });
        }
      },
      onCallHangup: async () => {
        setIsCardPhoneConference(false);
        setUUID(uuidv4());
        setVideoLayout(false);
        setConferenceStatus({
          created: false,
          answer: false,
          mute: false,
          hold: false,
          conference: false,
        });
        setTimeConferenceStatus(STATUS.STOPPED);
        setSecondsConferenceRemaining(INITIAL_COUNT);
        stop();
        cleanupMedia();
        if (simpleUser?.session) {
          setupRemoteMediaSimpleUser(simpleUser?.session);
        }
        await inviterUser?.unregister();
      },
      onUnregistered: async () => {
        setInviterUser(null);
      },
    };
    inviterUser?.session?.stateChange?.addListener((state) => {
      switch (state) {
        case SessionState.Initial:
          break;
        case SessionState.Establishing:
          break;
        case SessionState.Established:
          // setupRemoteMedia(inviterUser?.session);

          // simpleUser?.delegate.onCallAnswered();
          break;
        case SessionState.Terminating:
        // fall through
        case SessionState.Terminated:
          setIsCardPhoneConference(false);
          // cleanupMedia();
          // setupRemoteMediaSimpleUser(simpleUser?.session);
          break;
        default:
          throw new Error("Unknown session state.");
      }
    });
  }
  if (simpleUser !== null) {
    simpleUser.delegate = {
      onCallAnswered: async (e) => {
        const voiceonly =
          simpleUser?.session?._sessionDescriptionHandler?._remoteMediaStream?.getVideoTracks()
            ?.length === 0;
        setPhoneStatus({ answer: true });
        stop();

        // setTimeStatus(STATUS.STOPPED);
        // setSecondsRemaining(INITIAL_COUNT);
        // setTimeStatus(STATUS.STARTED);
        if (voiceonly !== undefined) {
          setVideoLayout(!voiceonly);
        }
      },
      onCallReceived: async (e) => {
        var tx = await recentCallList.transaction("RecentLists", "readwrite");
        var store = await tx.objectStore("RecentLists");
        await store.put({
          id: `${uuid}`,
          name: {
            displayName: `${
              simpleUser?.session?.remoteIdentity?.displayName
                ? simpleUser?.session?.remoteIdentity?.displayName
                : simpleUser?.session?.remoteIdentity?.uri?.user
            }`,
            date: dayjs().format(),
            status: "recived",
          },
          target: `${simpleUser?.session?.remoteIdentity?.uri?.user}`,
        });
        setFetch(true);
        showCard();
        setIsCardVisibleCallCreated(false);
        play({ RingtoneReceive });
        setTimeStatus(STATUS.STARTED);
      },

      onCallCreated: async (e) => {
        if (phoneStatus.created !== true) {
          setTimeStatus(STATUS.STARTED);
          setIsCardVisibleCallCreated(true);

          play({ RingtoneCall });
          if (
            simpleUser?.session?.sessionDescriptionHandlerOptions?.constraints
              ?.video
          ) {
            setVideoLayout(true);
          }
        }
      },
      onCallHold: (held) => {},
      onCallHangup: () => {
        setUUID(uuidv4());
        handleCancel();
        handleCancelCallCreated();
        setVideoLayout(false);
        setPhoneStatus({
          created: false,
          answer: false,
          mute: false,
          hold: false,
          conference: false,
        });
        setTimeStatus(STATUS.STOPPED);
        setSecondsRemaining(INITIAL_COUNT);
        stop();
        cleanupMedia();
        if (inviterUser?.session) {
          setupRemoteMediaSimpleUser(inviterUser?.session);
        }
      },

      onServerDisconnect: async () => {
        const audioEle = await getVideo("remote_audio_softphone");
        const videoRemote = await getVideo("remote_video_softphone");
        const videoLocal = await getVideo("local_video_softphone");
        const options = {
          aor: `sip:${user?.username} @${user?.ipServer} `,
          media: {
            constraints: { audio: true, video: true },
            remote: { audio: audioEle, video: videoRemote },
            local: { video: videoLocal },
          },
          userAgentOptions: {
            authorizationUsername: user?.username,
            authorizationPassword: user?.password,
            wsServers: server,
            uri: new URI("sip", user?.username, user?.ipServer),
            displayName: user?.username,
          },
        };

        const simple1 = new Web.SimpleUser(server, options);
        // const userAgent1 = new UserAgentCustom(server, options);

        // await userAgent1.connect();
        // await userAgent1
        //   .register(
        //     { expires: 3600 },
        //     {
        //       // An example of how to get access to a SIP response message for custom handling
        //       requestDelegate: {
        //         onReject: async (response) => {
        //           notification.error({
        //             message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
        //           });
        //         },
        //       },
        //     }
        //   )
        //   .then(async () => {
        //     await setInviterUser(userAgent1);
        //   });
        simple1.connect().then(() => {
          simple1
            .register(
              { expires: 3600 },
              {
                // An example of how to get access to a SIP response message for custom handling
                requestDelegate: {
                  onReject: async (response) => {
                    notification.error({
                      message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
                    });
                  },
                },
              }
            )
            .then(async (e) => {
              await setSimpleUser(simple1);
            })
            .catch((err) => {
              notification.error({
                message: "ผิดพลาด",
              });
            });
        });
      },

      onUnregistered: async () => {
        const audioEle = await getVideo("remote_audio_softphone");
        const videoRemote = await getVideo("remote_video_softphone");
        const videoLocal = await getVideo("local_video_softphone");
        const options = {
          aor: `sip:${user?.username} @${user?.ipServer} `,
          media: {
            constraints: { audio: true, video: true },
            remote: { audio: audioEle, video: videoRemote },
            local: { video: videoLocal },
          },
          userAgentOptions: {
            authorizationUsername: user?.username,
            authorizationPassword: user?.password,
            wsServers: server,
            uri: new URI("sip", user?.username, user?.ipServer),
            displayName: user?.username,
          },
        };

        const simple1 = new Web.SimpleUser(server, options);
        // const userAgent1 = new UserAgentCustom(server, options);
        // await userAgent1.connect();
        // await userAgent1
        //   .register(
        //     { expires: 3600 },
        //     {
        //       // An example of how to get access to a SIP response message for custom handling
        //       requestDelegate: {
        //         onReject: async (response) => {
        //           notification.error({
        //             message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
        //           });
        //         },
        //       },
        //     }
        //   )
        //   .then(async () => {
        //     await setInviterUser(userAgent1);
        //   });

        simple1.connect().then(() => {
          simple1
            .register(
              { expires: 3600 },
              {
                // An example of how to get access to a SIP response message for custom handling
                requestDelegate: {
                  onReject: async (response) => {
                    notification.error({
                      message: `การเข้าสู่ระบบด้วยหมายเลข "${user?.username}" ถูกปฏิเสธ.\n`,
                    });
                  },
                },
              }
            )
            .then(async (e) => {
              await setSimpleUser(simple1);
            })
            .catch((err) => {
              notification.error({
                message: "ผิดพลาด",
              });
            });
        });
      },
    };
  }
  // const toggleCollapsed = () => {
  //   setCollapse({
  //     collapsed: !collapse.collapsed,
  //   });
  // };
  // const onCollapse = (collapsed) => {
  //   setCollapse({ collapsed });
  // };
  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      {/* <Sider
        breakpoint="xxl"
        collapsible
        collapsed={(collapse.collapsed, collapsed)}
        onCollapse={onCollapse}
        theme="light"
      >
        <Menu>
          <Menu.Item
            onClick={() => {
              toggleCollapsed();
            }}
          >
            {React.createElement(
              collapse.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
              }
            )}
          </Menu.Item>
        </Menu>
        <SiderBar />
      </Sider> */}

      <Layout style={{ height: "100vh" }}>
        <Header style={{ padding: "0 0px", height: "8%" }}>
          <ToolBar />
        </Header>
        <Content
          style={{
            position: "relative",
          }}
        >
          <Row justify="center">
            <Col
              lg={8}
              md={10}
              xs={10}
              style={{ height: "89.7vh", paddingRight: "1%" }}
            >
              <DetailBar />
            </Col>
            {/* <Col span={8} md={0} xs={24} style={{ paddingRight: "1%" }}>
              <Collapse
                bordered={false}
                defaultActiveKey={["1"]}
                style={{
                  backgroundColor: "#ffffff",
                }}
                expandIcon={({ isActive }) =>
                  isActive ? (
                    <div>
                      <UpOutlined /> Hide Profile
                    </div>
                  ) : (
                    <div>
                      <DownOutlined /> Show Profile
                    </div>
                  )
                }
              >
                <Panel color="#ffffff" key="1" style={{ color: "#ffffff" }}>
                  <DetailBar />
                </Panel>
              </Collapse>
            </Col> */}
            <Col
              lg={15}
              md={13}
              xs={13}
              style={{
                backgroundImage: "url('/images/BGMain.png')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                paddingLeft: 0,
                paddingRight: 0,
                marginTop: "1%",
                marginLeft: "1%",
                height: "89vh",
              }}
            >
              {props.children}

              {isCardVisible ? (
                <CardPhone
                  conferenceStatus={conferenceStatus}
                  setConferenceStatus={setConferenceStatus}
                  handleCancel={handleCancel}
                  isCardVisible={isCardVisible}
                  phoneStatus={phoneStatus}
                  setPhoneStatus={setPhoneStatus}
                  setTimeStatus={setTimeStatus}
                  timeStatus={timeStatus}
                  setSecondsRemaining={setSecondsRemaining}
                  secondsRemaining={secondsRemaining}
                />
              ) : null}

              {isCardVisibleCallCreated ? (
                <CardPhoneCallCreated
                  handleCancelCallCreated={handleCancelCallCreated}
                  isCardVisibleCallCreated={isCardVisibleCallCreated}
                  phoneStatus={phoneStatus}
                  setPhoneStatus={setPhoneStatus}
                  setTimeStatus={setTimeStatus}
                  timeStatus={timeStatus}
                  setSecondsRemaining={setSecondsRemaining}
                  secondsRemaining={secondsRemaining}
                  conferenceStatus={conferenceStatus}
                  setConferenceStatus={setConferenceStatus}
                />
              ) : null}
              {isCardPhoneConference ? (
                <CardPhoneConference
                  conferenceStatus={conferenceStatus}
                  setConferenceStatus={setConferenceStatus}
                  setTimeConferenceStatus={setTimeConferenceStatus}
                  timeConferenceStatus={timeConferenceStatus}
                  setSecondsConferenceRemaining={setSecondsConferenceRemaining}
                  secondsConferenceRemaining={secondsConferenceRemaining}
                  isCardPhoneConference={isCardPhoneConference}
                />
              ) : null}
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};
export default LayoutLanding;
