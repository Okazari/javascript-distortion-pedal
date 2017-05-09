import audioContext from './audioContext'
import { addController } from './utils'

const equalizerFrequencies = [125, 250, 500, 1000, 2000, 3000, 4000, 6000, 8000, 16000];

equalizerFrequencies.forEach((frequency) => {
  addController(frequency, -20, 20, 1, 0, value => {})
});
