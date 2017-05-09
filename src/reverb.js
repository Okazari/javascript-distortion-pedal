import audioContext from './audioContext'
import { addController } from './utils'

addController('Reverb', 0, 1, 0.1, 0, value => {})

fetch('/assets/convolver.wav')
  .then(res => res.arrayBuffer())
  .then(audioData => {})
