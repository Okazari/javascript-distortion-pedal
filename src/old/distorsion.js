import audioContext from './audioContext'
import equalizer from './equalizer'
import { addController } from './utils'

//Creation du noeud de distortion
const distortionNode = audioContext.createWaveShaper()

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



distortionNode.oversample = '4x'
distortionNode.curve = makeDistortionCurve(0)

addController('Distortion', 0, 1, 0.1, 0, value => {
  distortionNode.curve = makeDistortionCurve(parseInt(20 * value))
  // equalizer.forEach(node => node.Q.value =  (2 * (1-value)) + 3)
})


export default distortionNode