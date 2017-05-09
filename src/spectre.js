import audioContext from './audioContext'

const spectre = document.getElementById('spectre')
const spectreCtx = spectre.getContext('2d')

const drawSpectre = () => {
  requestAnimationFrame(drawSpectre)

  spectreCtx.fillStyle = 'rgb(0, 0, 0)'
  spectreCtx.fillRect(0, 0, spectre.width, spectre.height)

  const lBarre = Math.floor((spectre.width / 150) * 2.5)

  let x = 0
  for(let i = 0; i < 150; i++) {
    const hBarre = 50

    spectreCtx.fillStyle = '#ABDCF6'
    spectreCtx.fillRect(x, spectre.height - hBarre / 1.5, lBarre, hBarre)

    x += lBarre + 1
  }
}

drawSpectre()

export default analyserSpectre
