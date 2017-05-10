import audioContext from './audioContext'
import { initCanva, addBar } from './utils'
const spectre = document.getElementById('spectre')
const spectreCtx = spectre.getContext('2d')

const drawSpectre = () => {
  requestAnimationFrame(drawSpectre)
  initCanva(spectreCtx, spectre)

  const nbBars = 150
  const barWidth = Math.floor((spectre.width / nbBarres) * 2.5)

  for(let i = 0; i < nbBarres; i++) {
    const barHeight = 50
    addBar(spectreCtx, spectre, barWidth, barHeight)
  }
}

drawSpectre()

export default analyserSpectre
