import audioContext from './audioContext'
import { addController } from './utils'

export const convolver = audioContext.createConvolver()
convolver.loop = true
convolver.normalize = true

export const convolverGain = audioContext.createGain()
convolverGain.gain.value = 0

export const masterCompression = audioContext.createDynamicsCompressor()

addController('Reverb', 0, 1, 0.1, 0, value => {
  convolverGain.gain.value = value
})

fetch('/assets/convolver.wav')
  .then(res => res.arrayBuffer())
  .then(audioData => {
    audioContext.decodeAudioData(audioData, (buffer) => {
      const concertHallBuffer = buffer
      convolver.buffer = concertHallBuffer
    })
  })
