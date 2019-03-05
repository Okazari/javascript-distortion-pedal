import audioContext from './audioContext'

const analyserSpectre = audioContext.createAnalyser()
analyserSpectre.fftSize = 256
analyserSpectre.smoothingTimeConstant = 0.9;
const spectre = document.getElementById('spectre')
const spectreCtx = spectre.getContext('2d')
const bufferSpectreLength = analyserSpectre.frequencyBinCount
const dataSpectreArray = new Uint8Array(bufferSpectreLength)

const drawSpectre = () => {
  requestAnimationFrame(drawSpectre)

  analyserSpectre.getByteFrequencyData(dataSpectreArray)

  spectreCtx.fillStyle = 'rgb(0, 0, 0)'
  spectreCtx.fillRect(0, 0, spectre.width, spectre.height)

  const lBarre = Math.floor((spectre.width / bufferSpectreLength) * 2.5)

  let x = 0
  for(let i = 0; i < bufferSpectreLength; i++) {
    let hBarre = dataSpectreArray[i]

    spectreCtx.fillStyle = '#ABDCF6'
    spectreCtx.fillRect(x, spectre.height - hBarre / 1.5, lBarre, hBarre)

    x += lBarre + 1
  }
}

drawSpectre()

export default analyserSpectre
