import audioContext from './audioContext'
import source from './source'
import gain from './gain';

source.connect(gain)
gain.connect(audioContext.destination)
