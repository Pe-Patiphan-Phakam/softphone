import React, { createContext, useContext, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const VideoLayoutContext = createContext()

const VideoLayout = () => {
  return (
    <div id="divshowvideo" style={{ bottom: '0px', right: '0px', width: "100%", height: "100%", position: 'fixed' }}>

      {/* {isPictureInPictureAvailable && (
        <button
          onClick={() => togglePictureInPicture(!isPictureInPictureActive)}
        >
          {isPictureInPictureActive? 'Disable' : 'Enable'} Picture in Picture
        </button>)} */}
      <video
        id='remote_video_softphone'
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
      </video>
      <video
        id='local_video_softphone'
        // src={simpleUser?.session?.sessionDescriptionHandler?.localMediaStream?.getVideoTracks()}
        style={{
          position: "absolute",
          bottom: "0px",
          right: "0px",
          width: "30%",
        }}
        autoPlay
        controls
      >
      </video>
    </div>
  )
}

export const VideoLayoutProvider = ({ children }) => {
  const [videoLayout, setVideoLayout] = useState(false)

  return (
    <VideoLayoutContext.Provider value={{ videoLayout, setVideoLayout }}>
      {children}
    </VideoLayoutContext.Provider>
  )
}
VideoLayoutProvider.propTypes = {
  children: PropTypes.node,
}
VideoLayoutProvider.defaultProps = {
  children: null,
}

export const WebcamConsumer = VideoLayoutContext.Consumer
export const useContainerLayout = () => useContext(VideoLayoutContext)

export default VideoLayoutContext
