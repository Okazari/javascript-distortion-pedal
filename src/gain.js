import audioContext from './audioContext'
import { addController } from './utils'

const gainNode = audioContext.createGain()
gainNode.gain.value = 0.1

addController('Gain', 0, 0.5, 0.05, gainNode.gain.value, (value) => {
  gainNode.gain.value = value
})

export default gainNode
