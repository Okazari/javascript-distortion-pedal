import audioContext from './audioContext'
import source from './source'
import gain from './gain'
import spectre from './spectre'

source.connect(gain)
gain.connect(spectre)
spectre.connect(audioContext.destination)
