import audioContext from './audioContext'
import { connectPlayButton } from './utils'

const audioUrl = './assets/acoustic2.wav'
const audioSource = new Audio(audioUrl)
audioSource.loop = true
connectPlayButton(audioSource)
const sourceNode = audioContext.createMediaElementSource(audioSource)

export default sourceNode