import React, { useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Button } from "antd";
import { Delete } from "react-feather";
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
// import Clear from "../sounds/Clear.mp3";

const Numpad = (props) => {
  const { onChange, onKeyPress } = props;

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

  const [inputValue, setInputValue] = useState("");

  const handleOnChange = (_value) => {
    const newValue = inputValue.concat(_value);
    setInputValue(newValue);
    onChange(newValue);
  };

  const onButtonPress = (_value) => {
    if (onChange) handleOnChange(_value);
    if (onKeyPress) onKeyPress(_value);
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
  };

  // const handleClear = () => {
  //   setInputValue('');
  //   onChange('');
  // }

  const handleClear = () => {
    const newString = inputValue.substring(0, inputValue.length - 1);
    setInputValue(newString);
    onChange(newString);
  };

  return (
    <Row
      gutter={[4, { xs: 0, sm: 2, md: 4, lg: 8 }]}
      alignContent="center"
      aligns="center"
    >
      {[1, 2, 3].map((value ) => (
        <Col span={8} key={value}>
          <Button
            onClick={() => onButtonPress(value)}
            style={{ width: "100%" }}
            variant="outlined"
            size="large"
          >
            {value}
          </Button>
        </Col>
      ))}

      {[4, 5, 6].map((value ) => (
        <Col span={8} key={value}>
          <Button
            onClick={() => onButtonPress(value)}
            style={{ width: "100%" }}
            variant="outlined"
            size="large"
          >
            {value}
          </Button>
        </Col>
      ))}

      {[7, 8, 9].map((value) => (
        <Col span={8} key={value}>
          <Button
            onClick={() => onButtonPress(value)}
            style={{ width: "100%" }}
            variant="outlined"
            size="large"
          >
            {value}
          </Button>
        </Col>
      ))}
      {["*", 0, "#"].map((value ) => (
        <Col span={8} key={value}>
          <Button
            onClick={() => onButtonPress(value)}
            style={{ width: "100%" }}
            variant="outlined"
            size="large"
          >
            {value}
          </Button>
        </Col>
      ))}

      {/* <Col span={8} key="dot"></Col>
      <Col span={8} key={0}>
        <Button
          onClick={() => onButtonPress(0)}
          variant="outlined"
          style={{ width: "100%" }}
          size="large"
        >
          0
        </Button>
      </Col> */}
      <Col span={8} key="dot"></Col>
      <Col span={8} key="dot"></Col>
      <Col span={8} key="clear">
        <Button
          type="text"
          disabled={!inputValue.length}
          onClick={handleClear}
          style={{ width: "100%" }}
          size="large"
          variant="outlined"
        >
          <Delete />
        </Button>
      </Col>
    </Row>
  );
};

Numpad.propTypes = {
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
};

Numpad.defaultProps = {
  onChange: undefined,
  onKeyPress: undefined,
};

export default Numpad;
