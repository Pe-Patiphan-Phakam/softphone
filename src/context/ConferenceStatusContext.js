import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useMultiState } from "../lib/hook";

const ConferenceStatusContext = createContext();

export const ConferenceStatusProvider = ({ children }) => {
  const [conferenceStatus, setConferenceStatus] = useMultiState({
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
    <ConferenceStatusContext.Provider value={{ conferenceStatus, setConferenceStatus }}>
      {children}
    </ConferenceStatusContext.Provider>
  );
};
ConferenceStatusProvider.propTypes = {
  children: PropTypes.node,
};
ConferenceStatusProvider.defaultProps = {
  children: null,
};

export const ConferenceStatusConsumer = ConferenceStatusContext.Consumer;

export const useConferenceStatus = () => useContext(ConferenceStatusContext);

export default ConferenceStatusContext;
