import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useMultiState } from "../lib/hook";

const PhoneStatusContext = createContext();

export const PhoneStatusProvider = ({ children }) => {
  const [phoneStatus, setPhoneStatus] = useMultiState({
    created: false,
    answer: false,
    mute: false,
    hold: false,
    conference: false
  });
  // const beep = useMemo(
  //   () => new UIFx('/asset/phoneStatuss/alarmphoneStatus3.mp3', {
  //     volume: 0.9,
  //     throttleMs: 50,
  //   }),
  //   [],
  // )

  // useEffect(() => {
  //     try {
  //         const localPhoneStatus = JSON.parse(localStorage.getItem('phoneStatus'))
  //         setPhoneStatus(localPhoneStatus)
  //     } catch (err) {
  //         console.error(err)
  //     }
  // }, [setPhoneStatus])
  // const openPhoneStatus = (e) => {
  //     if (e) {
  //         localStorage.setItem('phoneStatus', JSON.stringify(e))
  //     } else {
  //         localStorage.removeItem('phoneStatus')
  //     }
  //     setPhoneStatus(e)
  // }
  return (
    <PhoneStatusContext.Provider value={{ phoneStatus, setPhoneStatus }}>
      {children}
    </PhoneStatusContext.Provider>
  );
};
PhoneStatusProvider.propTypes = {
  children: PropTypes.node,
};
PhoneStatusProvider.defaultProps = {
  children: null,
};

export const PhoneStatusConsumer = PhoneStatusContext.Consumer;

export const usePhoneStatus = () => useContext(PhoneStatusContext);

export default PhoneStatusContext;
