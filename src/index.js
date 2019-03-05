const initialGain = 0.1
const initialDistortion = 0

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
    x;
  for (; i < n_samples; ++i) {
    x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
};

class MyAudioContext {
  constructor() {
    this.context = null
    this.playing = false
    this.playButton = document.getElementById('play')
    this.audioSource = new Audio('./assets/acoustic.wav')
    this.audioSource.loop = true
    this.createController('Gain', 0, 0.5, 0.05, initialGain)
    this.createController('Distortion', 0, 1, 0.1, initialDistortion)
    this.osciloscopeHtml = document.getElementById('oscilloscope')
    this.osciloCanvas = this.osciloscopeHtml.getContext('2d');
  }

  init = () => {
    this.context = new AudioContext()
    this.createNodes().then(() => {
      this.connect()
      this.drawOsciloscope()
      this.play()
      this.connectPlayButton()
    })
  }


  connect = () => {
    this.sourceNode.connect(this.gainNode)
    this.gainNode.connect(this.analyserOsciloscope)
    this.analyserOsciloscope.connect(this.distortionNode)
    this.distortionNode.connect(this.context.destination)
  }

  createNodes = () => {
    return this.createSourceNode().then(() => {
    // return this.createMicroSourceNode().then(() => {
      this.createGainNode()
      this.createDistortionNode()
    })
  }

  createGainNode = () => {
    this.gainNode = this.context.createGain()
    this.gainNode.gain.value = initialGain
    this.connectController('Gain', (value) => {
      this.gainNode.gain.value = value
    })
  }

  createDistortionNode = () => {
    this.distortionNode = this.context.createWaveShaper()
    this.distortionNode.oversample = '4x'
    this.distortionNode.curve = makeDistortionCurve(0)
    this.connectController('Distortion', (value) => {
      this.distortionNode.curve = makeDistortionCurve(parseInt(20 * value))
    })
  }

  connectController = (name, onChange) => {
    const input = document.getElementById(name)
    input.addEventListener('change', (event) => {
      onChange(event.target.value)
    })
    input.addEventListener('mousemove', (event) => {
      onChange(event.target.value)
    })
  }

  createOscillo = () => {
    this.analyserOsciloscope = this.context.createAnalyser();
    this.analyserOsciloscope.fftSize = 2048;
    this.analyserOsciloscope.maxDecibels = 10;
    this.analyserOsciloscope.minDecibels = 0;
    this.bufferLength = this.analyserOsciloscope.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }


  createController = (name, min, max, step, initial) => {
    const container = document.createElement('div')
    const label = document.createElement('label')
    label.innerText = name
    const input = document.createElement('input')
    input.id = name
    input.type = "range"
    input.min = min
    input.max = max
    input.step = step
    input.value = initial
    container.appendChild(label)
    container.appendChild(input)
    document.getElementById('container').appendChild(container)
  }

  createSourceNode = () => {
    this.sourceNode = this.context.createMediaElementSource(this.audioSource)
    return Promise.resolve()
  }

  createMicroSourceNode = () => {
    return getMicrophoneStream().then(stream => {
      this.source = this.audioCtx.createMediaStreamSource(stream)
    })
  }

  drawOsciloscope = () => {
    requestAnimationFrame(this.drawOsciloscope);
    this.osciloCanvas.fillStyle = 'rgb(0, 0, 0)';
    this.osciloCanvas.fillRect(0, 0, osciloscopeHtml.width, osciloscopeHtml.height);
    this.osciloCanvas.lineWidth = 2;
    this.osciloCanvas.strokeStyle = '#ABDCF6';
    this.osciloCanvas.beginPath();

    this.analyserOsciloscope.getByteTimeDomainData(this.dataArray);

    const sliceWidth = osciloscopeHtml.width * 1.0 / this.bufferLength;
    let x = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const y = (this.dataArray[i] / 128.0) * (osciloscopeHtml.height / 2);

      if (i === 0) { this.osciloCanvas.moveTo(x, y); }
      else { this.osciloCanvas.lineTo(x, y); }

      x += sliceWidth;
    }
    this.osciloCanvas.stroke();
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