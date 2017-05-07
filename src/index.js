import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'

source.connect(gain)
gain.connect(spectre)
spectre.connect(osciloscope)
osciloscope.connect(audioContext.destination)
