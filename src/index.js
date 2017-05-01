import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'
import distorsion from './distorsion'
import equalizerNodes from './equalizer'



source.connect(gain)
const lastEqualizerNode = equalizerNodes.reduce((previousNode, frequency) => {
  previousNode.connect(frequency);
  return frequency;
}, gain);
lastEqualizerNode.connect(distorsion)
distorsion.connect(osciloscope)
osciloscope.connect(spectre)
spectre.connect(audioContext.destination)
