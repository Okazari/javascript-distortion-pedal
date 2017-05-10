import audioContext from './audioContext'
import { connectPlayButton } from './utils'

const url = '/assets/acoustic.wav'
const audio = new Audio(url)
audio.loop = true
connectPlayButton(audio)

const source = audioContext.createMediaElementSource(audio)
export default source
