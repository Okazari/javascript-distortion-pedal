import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'
import distortion from './distorsion'

source.connect(distortion)
distortion.connect(gain)
gain.connect(spectre)
spectre.connect(osciloscope)
osciloscope.connect(audioContext.destination)
