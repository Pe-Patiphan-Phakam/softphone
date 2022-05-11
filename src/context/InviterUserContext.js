import React, {
    createContext, useState, useContext,
} from 'react'
import PropTypes from 'prop-types'


const InviterUserContext = createContext()






export const InviterUserProvider = ({ children }) => {

    const [inviterUser, setInviterUser] = useState(null)
    // const beep = useMemo(
    //   () => new UIFx('/asset/inviterUsers/alarminviterUser3.mp3', {
    //     volume: 0.9,
    //     throttleMs: 50,
    //   }),
    //   [],
    // )

    // useEffect(() => {
    //     try {
    //         const localInviterUser = JSON.parse(localStorage.getItem('inviterUser'))
    //         setInviterUser(localInviterUser)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }, [setInviterUser])
    // const openInviterUser = (e) => {
    //     if (e) {
    //         localStorage.setItem('inviterUser', JSON.stringify(e))
    //     } else {
    //         localStorage.removeItem('inviterUser')
    //     }
    //     setInviterUser(e)
    // }
    return (
        <InviterUserContext.Provider value={{ inviterUser, setInviterUser }}>
            {children}
        </InviterUserContext.Provider>
    )
}
InviterUserProvider.propTypes = {
    children: PropTypes.node,
}
InviterUserProvider.defaultProps = {
    children: null,
}

export const InviterUserConsumer = InviterUserContext.Consumer

export const useInviterUser = () => useContext(InviterUserContext)

export default InviterUserContext



