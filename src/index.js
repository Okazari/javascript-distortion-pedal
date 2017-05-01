import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'
import distorsion from './distorsion'

source.connect(gain)
gain.connect(distorsion)
distorsion.connect(osciloscope)
osciloscope.connect(spectre)
spectre.connect(audioContext.destination)
