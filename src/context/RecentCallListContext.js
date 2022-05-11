import React, {
    createContext, useState, useContext,
} from 'react'
import PropTypes from 'prop-types'
import { v4 as uuidv4 } from 'uuid';


const RecentCallListContext = createContext()






export const RecentCallListProvider = ({ children }) => {

    const [recentCallList, setRecentCallList] = useState(null)
    const [fetch, setFetch] = useState(false)
    const [uuid, setUUID] = useState(uuidv4())
    // const beep = useMemo(
    //   () => new UIFx('/asset/recentCallLists/alarmrecentCallList3.mp3', {
    //     volume: 0.9,
    //     throttleMs: 50,
    //   }),
    //   [],
    // )

    // useEffect(() => {
    //     try {
    //         const localRecentCallList = JSON.parse(localStorage.getItem('recentCallList'))
    //         setRecentCallList(localRecentCallList)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }, [setRecentCallList])
    // const openRecentCallList = (e) => {
    //     if (e) {
    //         localStorage.setItem('recentCallList', JSON.stringify(e))
    //     } else {
    //         localStorage.removeItem('recentCallList')
    //     }
    //     setRecentCallList(e)
    // }
    return (
        <RecentCallListContext.Provider value={{ recentCallList, setRecentCallList, fetch, setFetch, uuid, setUUID }}>
            {children}
        </RecentCallListContext.Provider>
    )
}
RecentCallListProvider.propTypes = {
    children: PropTypes.node,
}
RecentCallListProvider.defaultProps = {
    children: null,
}

export const RecentCallListConsumer = RecentCallListContext.Consumer

export const useRecentCallList = () => useContext(RecentCallListContext)

export default RecentCallListContext