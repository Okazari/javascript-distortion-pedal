import audioContext from './audioContext'
import { addController } from './utils'

const equalizerFrequencies = [125, 250, 500, 1000, 2000, 3000, 4000, 6000, 8000, 16000];

const equalizerNodes = equalizerFrequencies.map(function(frequency) {
  const filterNode = audioContext.createBiquadFilter();
  filterNode.type = "peaking";
  filterNode.frequency.value = frequency;
  filterNode.gain.value = 0;
  filterNode.Q.value = 5;
  addController(frequency, -20, 20, 1, 0, value => {
    filterNode.gain.value = value
  })
  return filterNode;
});

export default equalizerNodes
