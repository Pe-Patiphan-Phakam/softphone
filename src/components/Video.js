import React, {  useRef} from "react";
import video from "../assets/video.mp4";
import Draggable from "react-draggable";
import PropTypes from 'prop-types'
import usePictureInPicture from 'react-use-pip'
import { useSimpleUser } from "../context/SimpleUserContext";
import { SessionDescriptionHandler } from "sip.js/lib/platform/web";
import { Session } from "sip.js";
import { Typography } from "antd";

const Video = ({isVideoVisible}) => {
  const { Text } = Typography;
  const { simpleUser } = useSimpleUser();
  const videoRef = useRef(null)
  const {
    isPictureInPictureActive,
    isPictureInPictureAvailable,
    togglePictureInPicture,
  } = usePictureInPicture(videoRef)
  

  return (
    <Draggable bounds={{left: 50, top: 20, right: 0, bottom: 0}}>
    <div style={{bottom: '0px', right: '0px', width: "100%", height: "100%",display:isVideoVisible? 'block': 'none', position:'fixed'}}>
    
    {/* {isPictureInPictureAvailable && (
        <button
          onClick={() => togglePictureInPicture(!isPictureInPictureActive)}
        >
          {isPictureInPictureActive? 'Disable' : 'Enable'} Picture in Picture
        </button>)} */}
        <div>
                {simpleUser?.session?.remoteIdentity?.displayName?
                (<Text>{simpleUser?.session?.remoteIdentity?.displayName}</Text>):(<Text>{simpleUser?.session?.remoteIdentity?.uri?.user}</Text>)}
              </div>
        <video
        id='remoteremote'
        ref={videoRef}
          onTouchMove
          preview={{ visible: false }}
          style={{
            bottom: '0px', right: '0px',
            position: "relative",
            width: "100%",
            height: "100%",
          }}
          // src={simpleUser?.session?.sessionDescriptionHandler?.remoteMediaStream?.getVideoTracks()}
          autoPlay
          controls
        >
          
          <source  src={simpleUser?.session?.sessionDescriptionHandler?._remoteMediaStream?.getVideoTracks()}  />
          
        </video>
      
        <video 
        id='locallocal'
        // src={simpleUser?.session?.sessionDescriptionHandler?.localMediaStream?.getVideoTracks()}
          style={{
            position: "absolute",
            bottom: "0px",
            right: "0px",
            width: "30%",
           display:isPictureInPictureActive? 'none' : 'block' && isVideoVisible? 'block' : 'none'
          }}
          autoPlay
          controls
        >
          <source src={simpleUser?.session?.sessionDescriptionHandler?._localMediaStream?.getVideoTracks()} />
        </video>

    </div></Draggable>
  );
};
Video.propTypes = {
  isVideoVisible: PropTypes.bool
}
Video.defaultProps = {
  isVideoVisible: false
}
export default Video;
