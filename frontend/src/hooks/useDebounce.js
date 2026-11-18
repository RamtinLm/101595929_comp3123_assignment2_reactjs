import { useEffect, useState } from "react"

// Returns the value only after it stopped changing for "delay" ms
// Used by search so we do not send a request on every keystroke
export function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}
