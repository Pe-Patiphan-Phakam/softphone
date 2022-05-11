import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  Button,
  Col,
  Card,
  Row,
  Typography,
  Collapse,
  Input,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  PhoneFilled,
  AudioFilled,
  AudioMutedOutlined,
  PauseOutlined,
  TeamOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import { Avatar, notification } from "antd";
import { Delete } from "react-feather";
import { PhoneForwarded } from "react-feather";
import PropTypes from "prop-types";
import { useSimpleUser } from "../context/SimpleUserContext";

import Draggable from "react-draggable";
import { useContainerLayout } from "../context/VideoContext";
import AuthContext from "../context/AuthenContext";
import useSound from "use-sound";
import NoZero from "../sounds/NoZero.mp3";
import NoOne from "../sounds/NoOne.mp3";
import NoTwo from "../sounds/NoTwo.mp3";
import NoThree from "../sounds/NoThree.mp3";
import NoFour from "../sounds/NoFour.mp3";
import NoFive from "../sounds/NoFive.mp3";
import NoSix from "../sounds/NoSix.mp3";
import NoSeven from "../sounds/NoSeven.mp3";
import NoEight from "../sounds/NoEight.mp3";
import NoNine from "../sounds/NoNine.mp3";
import { useRecentCallList } from "../context/RecentCallListContext";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { Inviter, URI, UserAgent } from "sip.js";
import { useInviterUser } from "../context/InviterUserContext";
import { getVideo } from "./media";
import { UserAgentCustom } from "./../lib/userAgentFunc";

const CardPhone = (
  {
    conferenceStatus,
    setConferenceStatus,
    isCardVisible,
    handleCancel,
    phoneStatus,
    setPhoneStatus,
    setTimeStatus,
    timeStatus,
    setSecondsRemaining,
    secondsRemaining,
  },
  props
) => {
  const [Number0] = useSound(NoZero);
  const [Number1] = useSound(NoOne);
  const [Number2] = useSound(NoTwo);
  const [Number3] = useSound(NoThree);
  const [Number4] = useSound(NoFour);
  const [Number5] = useSound(NoFive);
  const [Number6] = useSound(NoSix);
  const [Number7] = useSound(NoSeven);
  const [Number8] = useSound(NoEight);
  const [Number9] = useSound(NoNine);
  const [value, setValue] = useState();
  const [inputValue, setInputValue] = useState("");
  const STATUS = {
    STARTED: "Started",
    STOPPED: "Stopped",
  };
  const INITIAL_COUNT = 0;
  const secondsToDisplay = secondsRemaining % 60;
  const minutesRemaining = (secondsRemaining - secondsToDisplay) / 60;
  const minutesToDisplay = minutesRemaining % 60;
  const hoursToDisplay = (minutesRemaining - minutesToDisplay) / 60;
  const { simpleUser } = useSimpleUser();

  const { Text } = Typography;
  const { user } = useContext(AuthContext);
  const { videoLayout, setVideoLayout } = useContainerLayout();
  const { Panel } = Collapse;
  const { onKeyPress } = props;
  const { recentCallList, setFetch, uuid, setUUID } = useRecentCallList();
  const handleReset = () => {
    setTimeStatus(STATUS.STOPPED);
    setSecondsRemaining(INITIAL_COUNT);
  };
  var mediaElement = document.getElementById("remote_audio_softphone");
  const { inviterUser, setInviterUser } = useInviterUser();
  const handleAnswer = async () => {
    var sdp = simpleUser?.session?.request?.body;
    var offeredAudio = false,
      offeredVideo = false;

    if (/\r\nm=audio /.test(sdp)) {
      offeredAudio = true;
    }
    if (/\r\nm=video /.test(sdp)) {
      offeredVideo = true;
    }
    if (sdp) {
      simpleUser?.answer({
        sessionDescriptionHandlerOptions: {
          streams: new MediaStream(),
          constraints: {
            audio: true,
            video: offeredVideo,
          },
        },
      });
      setPhoneStatus({ answer: true });
      // handleReset();
      // setTimeStatus(STATUS.STARTED);
    } else {
      // INVITE without SDP.  Must offer what we want and wait for ACK to see final media.
      simpleUser?.answer();
      setPhoneStatus({ answer: true });
      // handleReset();
      // setTimeStatus(STATUS.STARTED);
    }
  };

  const handleHold = async () => {
    await simpleUser?.hold().catch((err) => {
      notification.error({
        message: "ไม่สามารถพักสายได้",
      });
    });
  };
  const handleUnHold = async () => {
    await simpleUser?.unhold().catch((err) => {
      notification.error({
        message: "ไม่สามารถยกเลิกการพักสาย",
      });
    });
  };
  async function callConference() {
    setVideoLayout(false);
    setConferenceStatus({ conference: true });
    const server = user?.socketServer;
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
    const userAgent1 = new UserAgentCustom(server, options);
    await userAgent1.connect();
    await userAgent1
      .register(
        { expires: 3600 },
        {
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
    const inviter = new Inviter(userAgent1?.userAgent, target, inviterOptions);

    userAgent1
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
        // console.error(`Failure`, error)
        console.error(`[${value}] ไม่สามารถทำการเชื่อมต่อได้`);
        console.error(error);
        notification.error({
          message: `[${value}] ไม่สามารถทำการเชื่อมต่อได้\n`,
        });
      });
  }

  const handleHangUp = async () => {
    await simpleUser?.hangup();
    handleCancel();
    handleReset();
  };
  const handleDecline = async () => {
    await simpleUser?.decline();
    handleCancel();
    setPhoneStatus({ created: false, answer: false, mute: false });
    handleReset();
  };
  const handleMute = async () => {
    await simpleUser?.mute();
    setPhoneStatus({ mute: true });
  };
  const handleUnMute = async () => {
    await simpleUser?.unmute();
    setPhoneStatus({ mute: false });
  };

  const handleTransfer = async () => {
    try {
      const options = {
        onNotify: (noti) => {
          const message = noti?.request?.body;
          if (/404 Not Found\r\n/.test(message)) {
            notification.error({
              message: `"${value}" ไม่สามารถโอนสายได้\n`,
            });
          }
        },
        // An example of how to get access to a SIP response message for custom handling
        requestDelegate: {
          onReject: (response) => {
            notification.error({
              message: `"${value}" ไม่สามารถโอนสายได้\n ${response}`,
            });
          },
        },
      };
      const target = await UserAgent?.makeURI(`sip:${value}@${user?.ipServer}`);
      await simpleUser?.session?.refer(target, options);
      handleHangUp();
    } catch (e) {
      console.log("Error", e);
    }
  };
  const onChange = (_value) => {
    setValue(_value);
  };
  const handleOnChange = (_value) => {
    const newValue = inputValue.concat(_value);
    setInputValue(newValue);
    onChange(newValue);
  };

  const onButtonPress = useCallback(
    async (_value) => {
      if (onChange) handleOnChange(_value);
      if (onKeyPress) onKeyPress(_value);
      const duration = 500;
      const body = {
        contentDisposition: "render",
        contentType: "application/dtmf-relay",
        content: "Signal=" + _value + "\r\nDuration=" + duration,
      };
      const requestOptions = { body };
      await simpleUser.session.info({ requestOptions });
      switch (_value) {
        case 0:
          return Number0();
        case 1:
          return Number1();
        case 2:
          return Number2();
        case 3:
          return Number3();
        case 4:
          return Number4();
        case 5:
          return Number5();
        case 6:
          return Number6();
        case 7:
          return Number7();
        case 8:
          return Number8();
        case 9:
          return Number9();
        case "*":
          return Number1();
        case "#":
          return Number3();
        default:
          return null;
      }
    },
    [
      Number0,
      Number1,
      Number2,
      Number3,
      Number4,
      Number5,
      Number6,
      Number7,
      Number8,
      Number9,
      handleOnChange,
      onKeyPress,
      simpleUser,
    ]
  );
  const handleClear = () => {
    const newString = inputValue.substring(0, inputValue.length - 1);
    setInputValue(newString);
    onChange(newString);
  };

  // source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  // https://stackoverflow.com/a/2998874/1673761
  const twoDigits = (num) => String(num).padStart(2, "0");
  useInterval(
    () => {
      if (secondsRemaining >= 0) {
        setSecondsRemaining(secondsRemaining + 1);
      } else {
        setTimeStatus(STATUS.STOPPED);
      }
    },
    timeStatus === STATUS.STARTED ? 1000 : null
    // passing null stops the interval
  );
  if (simpleUser !== null) {
  }
  return (
    <Fragment>
      <Draggable>
        <Card
          bordered={false}
          style={{
            bottom: "0px",
            right: "0px",
            display: isCardVisible ? "block" : "none",
            position: "fixed",
            minWidth: "30%",
            zIndex: 2,
            background: videoLayout
              ? "rgba(0,0,0,0.1)"
              : "rgba(255,255,255,255)",
          }}
        >
          <Row gutter={[{ xs: 0, sm: 2, md: 3, lg: 5 }, 8]} justify="space-around" align="middle">
            <Col className="gutter-row" lg={4} md={2} xs={2}>
              <Avatar
                style={{ backgroundColor: "#096DD9" }}
                size={{ xs: 30, sm: 40, md: 50, lg: 50, xl: 70, xxl: 70 }}
                icon={<UserOutlined />}
              />
            </Col>
            <Col className="gutter-row" lg={3} md={4} xs={4}>
              <div>
                {simpleUser?.session?.remoteIdentity?.displayName ? (
                  <Text>
                    {simpleUser?.session?.remoteIdentity?.displayName}
                  </Text>
                ) : (
                  <Text>{simpleUser?.session?.remoteIdentity?.uri?.user}</Text>
                )}
              </div>
              {phoneStatus?.answer === false ? (
                <Text type="success">Calling from...</Text>
              ) : (
                <Text type="success">Talking</Text>
              )}

              <div>
                {twoDigits(hoursToDisplay)}:{twoDigits(minutesToDisplay)}:
                {twoDigits(secondsToDisplay)}
              </div>
            </Col>

            {phoneStatus?.answer === true ? (
              <Fragment>
                <Col className="gutter-row">
                  <Tooltip title={!phoneStatus.mute ? "Mute" : "Unmute"}>
                    <Button
                      style={{ backgroundColor: "#E8E5E5" }}
                      shape="circle"
                      onClick={() => {
                        if (!phoneStatus.mute) {
                          handleMute();
                        } else {
                          handleUnMute();
                        }
                      }}
                      icon={
                        !phoneStatus.mute ? (
                          <AudioFilled style={{ color: "#000000" }} />
                        ) : (
                          <AudioMutedOutlined style={{ color: "red" }} />
                        )
                      }
                      size="large"
                      block
                    />
                  </Tooltip>
                </Col>
                <Col className="gutter-row">
                  {!simpleUser?.isHeld() ? (
                    <Tooltip title="Hold">
                      <Button
                        shape="circle"
                        style={{ backgroundColor: "#E8E5E5" }}
                        icon={<PauseOutlined style={{ color: "#000000" }} />}
                        onClick={handleHold}
                        size="large"
                        block
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Unhold">
                      <Button
                        shape="circle"
                        style={{ backgroundColor: "#E8E5E5" }}
                        icon={
                          <PlayCircleOutlined style={{ color: "#000000" }} />
                        }
                        onClick={handleUnHold}
                        size="large"
                        block
                      />
                    </Tooltip>
                  )}
                </Col>

                <Col className="gutter-row">
                  <Tooltip title="Transfer">
                    <Button
                      style={{ backgroundColor: "#E8E5E5" }}
                      shape="circle"
                      onClick={handleTransfer}
                      disabled={
                        !value
                          ? true
                          : false || inviterUser?.session
                          ? true
                          : false
                      }
                      icon={
                        <PhoneForwarded
                          size={20}
                          style={{ color: "#000000", marginTop: "3px" }}
                        />
                      }
                      size="large"
                      block
                    />
                  </Tooltip>
                </Col>

                <Col
                  className="gutter-row"
                  style={{ display: videoLayout ? "none" : "flex" }}
                >
                  <Tooltip title="Conference">
                    <Button
                      style={{ backgroundColor: "#E8E5E5" }}
                      shape="circle"
                      disabled={
                        !value
                          ? true
                          : false && !videoLayout
                          ? true
                          : false || conferenceStatus?.conference
                          ? true
                          : false
                      }
                      onClick={callConference}
                      icon={
                        <TeamOutlined size={20} style={{ color: "#000000" }} />
                      }
                      size="large"
                      block
                    />
                  </Tooltip>
                </Col>
                <Col className="gutter-row">
                  <Tooltip title="Hangup">
                    <Button
                      shape="circle"
                      style={{ backgroundColor: "red" }}
                      onClick={handleHangUp}
                      icon={
                        <PhoneFilled
                          style={{ color: "#ffffff" }}
                          rotate={225}
                        />
                      }
                      size="large"
                      block
                    />
                  </Tooltip>
                </Col>
              </Fragment>
            ) : (
              <Fragment>
                <Row
                  justify="space-around"
                  align="middle"
                  style={{ width: "30%" }}
                >
                  <Col className="gutter-row" lg={3} md={3} xs={3}>
                    <Tooltip title="Accept">
                      <Button
                        shape="circle"
                        style={{ backgroundColor: "green" }}
                        onClick={handleAnswer}
                        icon={<PhoneFilled style={{ color: "#ffffff" }} />}
                        size="large"
                        block
                      />
                    </Tooltip>
                  </Col>
                  <Col className="gutter-row" lg={3} md={3} xs={3}>
                    <Tooltip title="Decline">
                      <Button
                        shape="circle"
                        style={{ backgroundColor: "red" }}
                        onClick={handleDecline}
                        icon={
                          <PhoneFilled
                            style={{ color: "#ffffff" }}
                            rotate={225}
                          />
                        }
                        size="large"
                        block
                      />
                    </Tooltip>
                  </Col>
                </Row>
              </Fragment>
            )}
          </Row>
          <Collapse
            bordered={true}
            style={{
              backgroundColor: "#ffffff",
              display: phoneStatus?.answer === false ? "none" : "flex",
            }}
          >
            <Panel
              header="Numpad"
              color="#ffffff"
              key="1"
              style={{ color: "#ffffff" }}
            >
              <Input
                placeholder="Tel."
                value={value}
                style={{ marginTop: "10%" }}
              />
              <Row
                gutter={[0, { xs: 0, sm: 2, md: 4, lg: 8 }]}
                alignContent="center"
                aligns="center"
                style={{ marginTop: "5%" }}
              >
                {[1, 2, 3].map((value) => (
                  <Col span={8} key={value}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      style={{ width: "95%" }}
                      variant="outlined"
                    >
                      {value}
                    </Button>
                  </Col>
                ))}

                {[4, 5, 6].map((value) => (
                  <Col span={8} key={value}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      style={{ width: "95%" }}
                      variant="outlined"
                    >
                      {value}
                    </Button>
                  </Col>
                ))}

                {[7, 8, 9].map((value) => (
                  <Col span={8} key={value}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      style={{ width: "95%" }}
                      variant="outlined"
                    >
                      {value}
                    </Button>
                  </Col>
                ))}

                {["*", 0, "#"].map((value) => (
                  <Col span={8} key={value}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      variant="outlined"
                      style={{ width: "95%" }}
                    >
                      {value}
                    </Button>
                  </Col>
                ))}
                <Col span={8} key="dot"></Col>
                <Col span={8} key="space"></Col>
                <Col span={8} key="clear">
                  <Button
                    type="text"
                    disabled={!inputValue.length}
                    onClick={() => {
                      handleClear();
                    }}
                    style={{ width: "95%" }}
                    variant="outlined"
                  >
                    <Delete />
                  </Button>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </Card>
      </Draggable>
    </Fragment>
  );
};
CardPhone.propTypes = {
  isCardVisible: PropTypes.bool,
  handleCancel: PropTypes.func,
  setPhoneStatus: PropTypes.func,
  phoneStatus: PropTypes.shape(),
  setTimeStatus: PropTypes.func,
  timeStatus: PropTypes.string,
  setSecondsRemaining: PropTypes.func,
  secondsRemaining: PropTypes.number,
};
CardPhone.defaultProps = {
  isCardVisible: false,
  handleCancel: () => {},
  setPhoneStatus: () => {},
  phoneStatus: {},
  setTimeStatus: () => {},
  timeStatus: "Stopped",
  setSecondsRemaining: () => {},
  secondsRemaining: 0,
};

export default CardPhone;
