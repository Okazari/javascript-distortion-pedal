import audioContext from './audioContext'
import { addController } from './utils'

//             name, min, max, step, init, callback
addController('Gain', 0, 0.5, 0.05, gainNode.gain.value, (value) => {})
