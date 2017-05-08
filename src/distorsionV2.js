import audioContext from './audioContext'
import { addController } from './utils'

function makeDistortionCurve( amount ) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

//low & high cut
const lowcut = audioContext.createBiquadFilter()
lowcut.type = "highpass";
lowcut.frequency.value = 20;
const highcut = audioContext.createBiquadFilter()
highcut.type = "lowpass";
highcut.frequency.value = 10000;

lowcut.connect(highcut)


const createPreamp = (type, frequency) => {
  const biquad = audioContext.createBiquadFilter()
  biquad.type = type
  biquad.frequency.value = frequency
  addController(`${frequency} Gain`, -20, 20, 1, 0, value => {
    biquad.gain.value = value
  })
  const waveShaper = audioContext.createWaveShaper()
  waveShaper.oversample = '4x'
  waveShaper.curve = makeDistortionCurve(0)
  addController(`${frequency} Disto`, 0, 1, 0.1, 0, value => {
    waveShaper.curve = makeDistortionCurve(parseInt(20 * value))
    // equalizer.forEach(node => node.Q.value =  (2 * (1-value)) + 3)
  })

  biquad.connect(waveShaper)
  // waveShaper.connect(gain)

  return {
    input: biquad,
    output:waveShaper
  }
}

const preamp1 = createPreamp('peaking', 185)
const preamp2 = createPreamp('peaking', 750)
const preamp3 = createPreamp('peaking', 2350)
const preamp4 = createPreamp('peaking', 5250)

highcut.connect(preamp1.input)
highcut.connect(preamp2.input)
highcut.connect(preamp3.input)
highcut.connect(preamp4.input)

const distoMaster = audioContext.createGain();
distoMaster.gain.value = 1
addController(`DistoMaster`, 0, 1, 0.05, 0.5, (value) => {
  distoMaster.gain.value = value
})

preamp1.output.connect(distoMaster)
preamp2.output.connect(distoMaster)
preamp3.output.connect(distoMaster)
preamp4.output.connect(distoMaster)

export const disto = {
  input: lowcut,
  output: distoMaster,
}
export default disto
