import React, { useState } from 'react'

const normal = () => {
    const [normal, setNormal] = useState(true)

    // yet another test running here
    const handleNormal = () => {
        setNormal(true)
    }

    // this comment is for testing whether the commands will work or not properly
    const handleSkim = () => {
        setNormal(false)
    }

    return (
        <div>
            {/* Shit i really hope that this comment should be skimmed for gods sake */}
            <button onClick={handleNormal}>Normal</button>
            {/* this another comment addition above the button tag */}
            <button onClick={handleSkim}>Skim</button>
        </div>
    )
}

export default normal