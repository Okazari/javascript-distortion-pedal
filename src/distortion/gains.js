import audioContext from '../audioContext'
import { addController } from '../utils'

const min = 0
const max = 1
const step = 0.05
const masterGain = audioContext.createGain()
masterGain.gain.value = 1
addController('Master gain', min, max, step, masterGain.gain.value, (value) => {
  masterGain.gain.value = value
})
const normalGain = audioContext.createGain()
const distortionGain = audioContext.createGain()
normalGain.gain.value = max
distortionGain.gain.value = 0
addController('Distortion gain', min, max, step, 0, (value) => {
  normalGain.gain.value = max -  .9*value
  distortionGain.gain.value = value
})

export default {
  master: masterGain,
  disto: distortionGain,
  normal: normalGain,
}
