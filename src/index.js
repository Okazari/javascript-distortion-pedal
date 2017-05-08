import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import { convolver, convolverGain, masterCompression } from './reverb'
import osciloscope from './osciloscope'
import distorsion from './distorsionV2'
import equalizerNodes from './equalizer'

source.connect(gain)
gain.connect(distorsion.input)
distorsion.output.connect(audioContext.destination)
// convolverGain.connect(convolver)
// convolver.connect(gain)
// gain.connect(masterCompression)
// const lastEqualizerNode = equalizerNodes.reduce((previousNode, frequency) => {
//   previousNode.connect(frequency)
//   return frequency
// }, masterCompression)
// lastEqualizerNode.connect(osciloscope)
// osciloscope.connect(spectre)
// spectre.connect(audioContext.destination)