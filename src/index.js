import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'
import distortion from './distorsion'
import equalizerNodes from './equalizer';

source.connect(distortion)
distortion.connect(gain)
const lastEqualizerNode = equalizerNodes.reduce((previousNode, frequency) => {
  previousNode.connect(frequency)
  return frequency
}, gain)
lastEqualizerNode.connect(spectre)
spectre.connect(osciloscope)
osciloscope.connect(audioContext.destination)
