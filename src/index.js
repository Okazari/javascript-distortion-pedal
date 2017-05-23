import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'
import distortion from './distortion'
import equalizerNodes from './equalizer'
import { convolver, convolverGain, masterCompression } from './reverb'

source.connect(distortion.input)
distortion.output.connect(gain)

gain.connect(masterCompression)

distortion.output.connect(convolverGain)
convolverGain.connect(convolver)
convolver.connect(masterCompression)

const lastEqualizerNode = equalizerNodes.reduce((previousNode, frequency) => {
  previousNode.connect(frequency)
  return frequency
}, masterCompression)
lastEqualizerNode.connect(spectre)
spectre.connect(osciloscope)
osciloscope.connect(audioContext.destination)
