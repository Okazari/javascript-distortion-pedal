import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'
import osciloscope from './osciloscope'

source.connect(gain)
gain.connect(osciloscope)
osciloscope.connect(spectre)
spectre.connect(audioContext.destination)
