import React from 'react'
import useSound from '../../src'
import Button from '../helpers/Button'
import boopSfx from '../sounds/boop.mp3'

const Simple = () => {
  const [playBoop] = useSound(boopSfx)

  return <Button onClick={playBoop}>Play sound</Button>
}

export default Simple
