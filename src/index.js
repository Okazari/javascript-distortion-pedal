const initialGain = 0.1
const maxGain = 1
const initialDistortion = 0
const initialReverbGain = 0
const gainName = 'Gain'
const clearGainName = 'Clear Gain'
const distortionName = 'Distortion'

const frequenciesCut = [160, 320, 640, 1280, 3560, 7220, 12800]
  .map((freq, index, freqs) => {
    if (freqs.length > index + 1) return [freq, freqs[index + 1]]
  })
  .filter(a => a)

const getFrequencyControllerName = (min, max) => `Disto ${min}-${max}`
const getFrequencyGainName = (min, max) => `Gain ${min}-${max}`

const getMicrophoneStream = () => {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  return new Promise((resolve, reject) => {
    navigator.getUserMedia(
      { audio: true },
      medias => resolve(medias),
      error => reject(error)
    )
  })
}

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x
  for (; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
  }
  return curve
}

class MyAudioContext {
  constructor() {
    this.context = null
    this.playing = false
    this.playButton = document.getElementById('play')
    // this.audioSource = new Audio('./assets/acoustic.wav')
    // this.audioSource.loop = true
    this.createController(gainName, 0, maxGain, 0.05, initialGain)
    // this.createController('Distortion', 0, 1, 0.1, initialDistortion)
    // this.createController('Reverb', 0, 1, 0.1, initialReverbGain)
    // this.osciloscopeHtml = document.getElementById('oscilloscope')
    // this.osciloCanvas = this.osciloscopeHtml.getContext('2d')
    // this.spectreHtml = document.getElementById('spectre')
    // this.spectreCanvas = this.spectreHtml.getContext('2d')
    // frequenciesCut.forEach(([min, max]) => {
    //   this.createController(getFrequencyGainName(min, max), 0, 0.5, 0.05, 0)
    //   this.createController(getFrequencyControllerName(min, max), 0, 0.5, 0.05, 0)
    // })
  }

  init = () => {
    this.context = new AudioContext()
    this.createNodes().then(() => {
      this.connect()
      // this.drawOsciloscope()
      // this.drawSpectre()
      this.play()
      this.connectPlayButton()
    })
  }

  connect = () => {
    this.sourceNode.connect(this.gainNode)
    this.gainNode.connect(this.context.destination)
    // this.sourceNode.connect(this.gainNode)
    // const freqOutputNodes = this.freqsNodes.map(
    //   ({ highcut, lowcut, gain, disto }) => {
    //     this.gainNode.connect(lowcut)
    //     lowcut.connect(highcut)
    //     highcut.connect(gain)
    //     gain.connect(disto)
    //     return disto
    //   }
    // )
    // freqOutputNodes.forEach(node => {
    //   node.connect(this.masterCompression)
    // })

    // this.gainNode.connect(this.masterCompression)
    // this.distortionNode.connect(this.convolverGain)
    // this.convolverGain.connect(this.convolverNode)
    // this.convolverNode.connect(this.masterCompression)

    // this.masterCompression.connect(this.analyserOsciloscope)
    // this.analyserOsciloscope.connect(this.analyserSpectre)
    // this.analyserSpectre.connect(this.context.destination)
  }

  createNodes = () => {
    // return this.createSourceNode().then(() => {
    return this.createMicroSourceNode().then(() => {
      this.createGainNode()
      // this.createDistortionNode()
      // this.createReverbNodes()
      // this.createOscillo()
      // this.createSpectre()
      // this.createFreqsDisto()
    })
  }

  createFreqsDisto = () => {
    this.freqsNodes = frequenciesCut.map(([min, max]) => {
      const lowcut = this.context.createBiquadFilter()
      lowcut.type = 'highpass'
      lowcut.frequency.value = min
      const highcut = this.context.createBiquadFilter()
      highcut.type = 'lowpass'
      highcut.frequency.value = max
      const gain = this.context.createGain()
      gain.gain.value = 0
      this.connectController(getFrequencyGainName(min, max), value => {
        gain.gain.value = value
      })
      const disto = this.context.createWaveShaper()
      disto.oversample = '4x'
      disto.curve = makeDistortionCurve(0)
      this.connectController(getFrequencyControllerName(min, max), value => {
        disto.curve = makeDistortionCurve(parseInt(20 * value))
      })
      return {
        lowcut,
        highcut,
        gain,
        disto
      }
    })
  }

  createGainNode = () => {
    this.gainNode = this.context.createGain()
    this.gainNode.gain.value = initialGain
    this.connectController(gainName, value => {
      this.gainNode.gain.value = value
    })
  }

  createDistortionNode = () => {
    this.distortionNode = this.context.createWaveShaper()
    this.distortionNode.oversample = '4x'
    this.distortionNode.curve = makeDistortionCurve(0)
    this.connectController(distortionName, value => {
      this.distortionNode.curve = makeDistortionCurve(parseInt(20 * value))
    })
  }

  createReverbNodes = () => {
    this.convolverNode = this.context.createConvolver()
    this.convolverNode.loop = true
    this.convolverNode.normalize = true

    this.convolverGain = this.context.createGain()
    this.convolverGain.gain.value = initialReverbGain
    this.connectController('Reverb', value => {
      this.convolverGain.gain.value = value
    })

    this.masterCompression = this.context.createDynamicsCompressor()

    fetch('/assets/convolver.wav')
      .then(res => res.arrayBuffer())
      .then(audioData => {
        this.context.decodeAudioData(audioData, buffer => {
          const concertHallBuffer = buffer
          this.convolverNode.buffer = concertHallBuffer
        })
      })
  }

  createOscillo = () => {
    this.analyserOsciloscope = this.context.createAnalyser()
    this.analyserOsciloscope.fftSize = 2048
    this.analyserOsciloscope.maxDecibels = 10
    this.analyserOsciloscope.minDecibels = 0
    this.bufferLength = this.analyserOsciloscope.frequencyBinCount
    this.dataArray = new Uint8Array(this.bufferLength)
  }

  createSpectre = () => {
    this.analyserSpectre = this.context.createAnalyser()
    this.analyserSpectre.fftSize = 256
    this.analyserSpectre.smoothingTimeConstant = 0.9
    this.bufferSpectreLength = this.analyserSpectre.frequencyBinCount
    this.dataSpectreArray = new Uint8Array(this.bufferSpectreLength)
  }

  createController = (name, min, max, step, initial) => {
    const container = document.createElement('div')
    const label = document.createElement('label')
    label.innerText = name
    const input = document.createElement('input')
    input.id = name
    input.type = 'range'
    input.min = min
    input.max = max
    input.step = step
    input.value = initial
    container.appendChild(label)
    container.appendChild(input)
    document.getElementById('container').appendChild(container)
  }

  connectController = (name, onChange) => {
    const input = document.getElementById(name)
    input.addEventListener('change', event => {
      onChange(event.target.value)
    })
    input.addEventListener('mousemove', event => {
      onChange(event.target.value)
    })
  }

  createSourceNode = () => {
    this.sourceNode = this.context.createMediaElementSource(this.audioSource)
    return Promise.resolve()
  }

  createMicroSourceNode = () => {
    return getMicrophoneStream().then(stream => {
      this.sourceNode = this.context.createMediaStreamSource(stream)
    })
  }

  drawOsciloscope = () => {
    requestAnimationFrame(this.drawOsciloscope)
    this.osciloCanvas.fillStyle = 'rgb(0, 0, 0)'
    this.osciloCanvas.fillRect(
      0,
      0,
      this.osciloscopeHtml.width,
      this.osciloscopeHtml.height
    )
    this.osciloCanvas.lineWidth = 2
    this.osciloCanvas.strokeStyle = '#ABDCF6'
    this.osciloCanvas.beginPath()

    this.analyserOsciloscope.getByteTimeDomainData(this.dataArray)

    const sliceWidth = (this.osciloscopeHtml.width * 1.0) / this.bufferLength
    let x = 0
    for (let i = 0; i < this.bufferLength; i++) {
      const y = (this.dataArray[i] / 128.0) * (this.osciloscopeHtml.height / 2)

      if (i === 0) {
        this.osciloCanvas.moveTo(x, y)
      } else {
        this.osciloCanvas.lineTo(x, y)
      }

      x += sliceWidth
    }
    this.osciloCanvas.stroke()
  }

  drawSpectre = () => {
    requestAnimationFrame(this.drawSpectre)

    this.analyserSpectre.getByteFrequencyData(this.dataSpectreArray)

    this.spectreCanvas.fillStyle = 'rgb(0, 0, 0)'
    this.spectreCanvas.fillRect(
      0,
      0,
      this.spectreHtml.width,
      this.spectreHtml.height
    )

    const lBarre = Math.floor(
      (this.spectreHtml.width / this.bufferSpectreLength) * 2.5
    )

    let x = 0
    for (let i = 0; i < this.bufferSpectreLength; i++) {
      let hBarre = this.dataSpectreArray[i]

      this.spectreCanvas.fillStyle = '#ABDCF6'
      this.spectreCanvas.fillRect(
        x,
        this.spectreHtml.height - hBarre / 1.5,
        lBarre,
        hBarre
      )

      x += lBarre + 1
    }
  }

  connectPlayButton = () => {
    this.playButton.addEventListener('click', () => {
      if (this.playing) {
        this.stop()
      } else {
        this.play()
      }
    })
  }

  play = () => {
    this.audioSource.play()
    this.playButton.innerText = 'Stop'
    this.playing = true
  }

  stop = () => {
    this.audioSource.pause()
    this.audioSource.currentTime = 0
    this.playButton.innerText = 'Play'
    this.playing = false
  }
}

const myAudioContext = new MyAudioContext()

myAudioContext.playButton.addEventListener('click', () => {
  if (!myAudioContext.context) myAudioContext.init()
})

export default myAudioContext
