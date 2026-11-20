import React from 'react'
import useSound from '../../src'
import Button from '../helpers/Button'
import dunDunDunSfx from '../sounds/dun-dun-dun.mp3'

const ShowWhilePlaying = () => {
  const [isPlaying, setIsPlaying] = React.useState(false)

  const [playBoop] = useSound(dunDunDunSfx, {
    onplay: () => setIsPlaying(true),
    onend: () => setIsPlaying(false),
  })

  return (
    <>
      <h2>Is playing: {isPlaying.toString()}</h2>
      <br />
      <Button onClick={playBoop}>Play sound</Button>
    </>
  )
}

export default ShowWhilePlaying
