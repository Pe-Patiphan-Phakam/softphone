import React, {
    createContext, useState, useContext, 
} from 'react'
import PropTypes from 'prop-types'


const SimpleUserContext = createContext()


 


  
export const SimpleUserProvider = ({ children }) => {
    
    const [simpleUser, setSimpleUser] = useState(null)
    // const beep = useMemo(
    //   () => new UIFx('/asset/simpleUsers/alarmsimpleUser3.mp3', {
    //     volume: 0.9,
    //     throttleMs: 50,
    //   }),
    //   [],
    // )

    // useEffect(() => {
    //     try {
    //         const localSimpleUser = JSON.parse(localStorage.getItem('simpleUser'))
    //         setSimpleUser(localSimpleUser)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }, [setSimpleUser])
    // const openSimpleUser = (e) => {
    //     if (e) {
    //         localStorage.setItem('simpleUser', JSON.stringify(e))
    //     } else {
    //         localStorage.removeItem('simpleUser')
    //     }
    //     setSimpleUser(e)
    // }
    return (
        <SimpleUserContext.Provider value={{ simpleUser, setSimpleUser }}>
            {children}
        </SimpleUserContext.Provider>
    )
}
SimpleUserProvider.propTypes = {
    children: PropTypes.node,
}
SimpleUserProvider.defaultProps = {
    children: null,
}

export const SimpleUserConsumer = SimpleUserContext.Consumer

export const useSimpleUser = () => useContext(SimpleUserContext)

export default SimpleUserContext

   
 
