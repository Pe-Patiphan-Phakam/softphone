import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import {
  Button,
  Col,
  Card,
  Row,
  Typography,
  Collapse,
  Input,
  notification,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  AudioMutedOutlined,
  AudioFilled,
  PauseOutlined,
  PhoneFilled,
  PlayCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Delete } from "react-feather";
import { PhoneForwarded } from "react-feather";
import { Avatar } from "antd";
import PropTypes from "prop-types";
import Draggable from "react-draggable";

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
import AuthContext from "../context/AuthenContext";
import { useContainerLayout } from "../context/VideoContext";
import { useRecentCallList } from "../context/RecentCallListContext";
import { UserAgent } from "sip.js";
import { useInviterUser } from "../context/InviterUserContext";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { Inviter } from "sip.js";
import { useSimpleUser } from "../context/SimpleUserContext";

const CardPhoneConference = (
  {
    isCardPhoneConference,
    setPhoneStatus,
    phoneStatus,
    conferenceStatus,
    setConferenceStatus,
    setTimeConferenceStatus,
    timeConferenceStatus,
    setSecondsConferenceRemaining,
    secondsConferenceRemaining,
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
  const { Text } = Typography;
  const [value, setValue] = useState();

  const { videoLayout, setVideoLayout } = useContainerLayout();
  const STATUS = {
    STARTED: "Started",
    STOPPED: "Stopped",
  };
  const { user } = useContext(AuthContext);
  const INITIAL_COUNT = 0;
  const { Panel } = Collapse;
  const { inviterUser } = useInviterUser();
  const { simpleUser } = useSimpleUser();
  const { onKeyPress } = props;
  const secondsToDisplay = secondsConferenceRemaining % 60;
  const minutesRemaining = (secondsConferenceRemaining - secondsToDisplay) / 60;
  const minutesToDisplay = minutesRemaining % 60;
  const hoursToDisplay = (minutesRemaining - minutesToDisplay) / 60;
  const [inputValue, setInputValue] = useState("");
  const { recentCallList, setRecentCallList, setFetch, uuid, setUUID } =
    useRecentCallList();

  const handleHangUp = async () => {
    await inviterUser?.hangup();
    setConferenceStatus({ created: false, answer: false });
    handleResetTime();
  };
  const onChange = (_value) => {
    setValue(_value);
  };
  const handleMute = async () => {
    await inviterUser?.mute();
    setConferenceStatus({ mute: true });
  };
  const handleUnMute = async () => {
    await inviterUser?.unmute();
    setConferenceStatus({ mute: false });
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
      await inviterUser?.session?.refer(target, options);
      handleHangUp();
    } catch (e) {
      console.log("Error", e);
    }
  };

  const handleHold = async () => {
    await inviterUser?.hold().catch((err) => {
      notification.error({
        message: "ไม่สามารถพักสายได้",
      });
    });
  };
  const handleUnHold = async () => {
    await inviterUser?.unhold().catch((err) => {
      notification.error({
        message: "ไม่สามารถยกเลิกการพักสาย",
      });
    });
  };

  function callConference() {
    setVideoLayout(false);
    setConferenceStatus({ conference: true });
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
        console.error(`[${value}] ไม่สามารถทำการเชื่อมต่อได้`);
        console.error(error);
        notification.error({
          message: `[${value}] ไม่สามารถทำการเชื่อมต่อได้\n`,
        });
      });
  }

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
      await inviterUser.session.info({ requestOptions });
      // inviterUser?.sendDTMF(_value);
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
      inviterUser,
    ]
  );
  const handleClear = () => {
    const newString = inputValue.substring(0, inputValue.length - 1);
    setInputValue(newString);
    onChange(newString);
  };

  const handleResetTime = () => {
    setTimeConferenceStatus(STATUS.STOPPED);
    setSecondsConferenceRemaining(INITIAL_COUNT);
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
      if (secondsConferenceRemaining >= 0) {
        setSecondsConferenceRemaining(secondsConferenceRemaining + 1);
      } else {
        setTimeConferenceStatus(STATUS.STOPPED);
      }
    },
    timeConferenceStatus === STATUS.STARTED ? 1000 : null
    // passing null stops the interval
  );

  return (
    <Fragment>
      <Draggable>
        <Card
          bordered={true}
          style={{
            bottom: "0px",
            right: "0px",
            display: isCardPhoneConference ? "block" : "none",
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
                {inviterUser?.session?.remoteIdentity?.displayName ? (
                  <Text>
                    {inviterUser?.session?.remoteIdentity?.displayName}
                  </Text>
                ) : (
                  <Text>{inviterUser?.session?.remoteIdentity?.uri?.user}</Text>
                )}
              </div>
              {!conferenceStatus?.answer ? (
                <Text
                  type="success"
                  style={{ display: simpleUser?.session ? "flex" : "none" }}
                >
                  invite meeting
                </Text>
              ) : (
                <Text
                  type="success"
                  style={{ display: simpleUser?.session ? "flex" : "none" }}
                >
                  meeting
                </Text>
              )}
              {!phoneStatus?.answer ? (
                <Text
                  type="success"
                  style={{ display: !simpleUser?.session ? "flex" : "none" }}
                >
                  talking
                </Text>
              ) : null}
              <div>
                {twoDigits(hoursToDisplay)}:{twoDigits(minutesToDisplay)}:
                {twoDigits(secondsToDisplay)}
              </div>
            </Col>

            {conferenceStatus?.answer === false ? (
              <Fragment>
                <Col className="gutter-row" lg={3} md={3} xs={3}>
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
                <Col className="gutter-row">
                  <Tooltip title={!conferenceStatus?.mute ? "Mute" : "Unmute"}>
                    <Button
                      style={{ backgroundColor: "#E8E5E5" }}
                      shape="circle"
                      onClick={() => {
                        if (!conferenceStatus?.mute) {
                          handleMute();
                        } else {
                          handleUnMute();
                        }
                      }}
                      icon={
                        !conferenceStatus?.mute ? (
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
                  {!inviterUser?.isHeld() ? (
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
                          : false || simpleUser?.session
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
                <Col className="gutter-row">
                  <Tooltip title="Conference">
                    <Button
                      style={{ backgroundColor: "#E8E5E5" }}
                      shape="circle"
                      disabled={
                        !value
                          ? true
                          : false && !videoLayout
                          ? true
                          : false || simpleUser?.session
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
                  <Tooltip title="HangUp">
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
            )}
          </Row>
          <Collapse
            bordered={false}
            style={{
              backgroundColor: "#ffffff",
              display: conferenceStatus?.answer === false ? "none" : "flex",
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
                {[1, 2, 3].map((value, keyValue) => (
                  <Col span={8} key={keyValue}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      style={{ width: "95%" }}
                      variant="outlined"
                    >
                      {value}
                    </Button>
                  </Col>
                ))}

                {[4, 5, 6].map((value, keyValue) => (
                  <Col span={8} key={keyValue}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      style={{ width: "95%" }}
                      variant="outlined"
                    >
                      {value}
                    </Button>
                  </Col>
                ))}

                {[7, 8, 9].map((value, keyValue) => (
                  <Col span={8} key={keyValue}>
                    <Button
                      onClick={() => onButtonPress(value)}
                      style={{ width: "95%" }}
                      variant="outlined"
                    >
                      {value}
                    </Button>
                  </Col>
                ))}

                {["*", 0, "#"].map((value, keyValue) => (
                  <Col span={8} key={keyValue}>
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
CardPhoneConference.propTypes = {
  isCardPhoneConference: PropTypes.bool,
  handleCancelCallCreated: PropTypes.func,
  setConferenceStatus: PropTypes.func,
  conferenceStatus: PropTypes.shape(),
  setTimeConferenceStatus: PropTypes.func,
  timeConferenceStatus: PropTypes.string,
  setSecondsConferenceRemaining: PropTypes.func,
  secondsConferenceRemaining: PropTypes.number,
};
CardPhoneConference.defaultProps = {
  isCardPhoneConference: false,
  handleCancelCallCreated: () => {},
  setConferenceStatus: () => {},
  conferenceStatus: {},
  setTimeConferenceStatus: () => {},
  timeConferenceStatus: "Stopped",
  setSecondsConferenceRemaining: () => {},
  secondsConferenceRemaining: 0,
};

export default CardPhoneConference;
