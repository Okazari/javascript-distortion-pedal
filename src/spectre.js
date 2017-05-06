import audioContext from './audioContext'
import { initCanva, addBar } from './utils'
const spectre = document.getElementById('spectre')
const spectreCtx = spectre.getContext('2d')

const analyser = audioContext.createAnalyser()
analyser.fftSize = 256
const nbFrequencies = analyser.frequencyBinCount
const frequenciesPower = new Uint8Array(nbFrequencies)

const drawSpectre = () => {
  requestAnimationFrame(drawSpectre)
  initCanva(spectreCtx, spectre)

  analyser.getByteFrequencyData(frequenciesPower)
  const barWidth = Math.floor((spectre.width / nbFrequencies) * 2.5)

  for(let i = 0; i < nbFrequencies; i++) {
    const barHeight = frequenciesPower[i]
    addBar(spectreCtx, spectre, barWidth, barHeight)
  }
}

drawSpectre()

export default analyser
