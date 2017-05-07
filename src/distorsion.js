import audioContext from './audioContext'
import { addController } from './utils'

//Creation du noeud de distortion
const distortionNode = audioContext.createWaveShaper()
distortionNode.oversample = '4x'
distortionNode.curve = makeDistortionCurve(0)

function makeDistortionCurve(amount) {
  let k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) )
  }
  return curve
};

addController('Distortion', 0, 1, 0.1, 0, value => {
  distortionNode.curve = makeDistortionCurve(parseInt(20 * value))
})

export default distortionNode
