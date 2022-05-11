import {
    useState, useEffect, useRef, useMemo,
} from 'react'

export const useInterval = (callback, delay = 1000) => {
    const savedCallback = useRef()
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])
    useEffect(() => {
        const tick = () => {
            savedCallback.current()
        }
        const id = setInterval(tick, delay)
        return () => clearInterval(id)
    }, [delay])
}

export const useMultiState = (initState) => {
    const [state, setState] = useState(initState)
    const updateState = useMemo(() => (newState) => {
        if (typeof newState === 'function') {
            setState((prevState) => ({ ...prevState, ...newState(prevState) }))
        } else {
            setState((prevState) => ({ ...prevState, ...newState }))
        }
    }, [setState])
    return [state, updateState]
}

export const usePrevious = (value) => {
    const ref = useRef()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}
export const useScroll = () => {
    // storing this to get the scroll direction
    const [lastScrollTop, setLastScrollTop] = useState(0);
    // the offset of the document.body
    const [bodyOffset, setBodyOffset] = useState(
        document.body.getBoundingClientRect()
    );
    // the vertical direction
    const [scrollY, setScrollY] = useState(bodyOffset.top);
    // the horizontal direction
    const [scrollX, setScrollX] = useState(bodyOffset.left);
    // scroll direction would be either up or down
    const [scrollDirection, setScrollDirection] = useState();

    const listener = e => {
        setBodyOffset(document.body.getBoundingClientRect());
        setScrollY(-bodyOffset.top);
        setScrollX(bodyOffset.left);
        setScrollDirection(lastScrollTop > -bodyOffset.top ? "down" : "up");
        setLastScrollTop(-bodyOffset.top);
    };

    useEffect(() => {
        window.addEventListener("scroll", listener);
        return () => {
            window.removeEventListener("scroll", listener);
        };
    });

    return {
        scrollY,
        scrollX,
        scrollDirection
    };
}