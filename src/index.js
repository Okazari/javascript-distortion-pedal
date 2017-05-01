import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import { convolver, convolverGain, masterCompression } from './reverb'
import osciloscope from './osciloscope'
import distorsion from './distorsion'
import equalizerNodes from './equalizer'

source.connect(distorsion)
distorsion.connect(gain)
distorsion.connect(convolverGain)
convolverGain.connect(convolver)
convolver.connect(gain)
gain.connect(masterCompression)
const lastEqualizerNode = equalizerNodes.reduce((previousNode, frequency) => {
  previousNode.connect(frequency)
  return frequency
}, masterCompression)
lastEqualizerNode.connect(osciloscope)
osciloscope.connect(spectre)
spectre.connect(audioContext.destination)