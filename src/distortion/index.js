import audioContext from '../audioContext'
import makeDistortion from './distortion'
import gains from './gains'
import { addController } from '../utils'

const makeDistoFromFreq = (frequency, power) => {
  const distortion = makeDistortion()
  const gain = audioContext.createGain()
  gain.gain.value = power
  addController(`Disto ${frequency}`, 0, 5, 0.05, gain.gain.value, (value) => {
    gain.gain.value = value
  })
  const bandpass = audioContext.createBiquadFilter()
  bandpass.type = "peak";
  bandpass.frequency.value = frequency;
  bandpass.Q.value = 3;
  gain.connect(bandpass)
  bandpass.connect(distortion)
  return {
    input: gain,
    output: distortion
  }
}
const masterCompression = audioContext.createDynamicsCompressor()
const disto500 = makeDistoFromFreq(500, 3)
const disto1000 = makeDistoFromFreq(1000, 2)
const disto2000 = makeDistoFromFreq(2000, 1)
const disto4000 = makeDistoFromFreq(4000, 1)
gains.master.connect(gains.normal)
gains.normal.connect(masterCompression)
gains.master.connect(gains.disto)
gains.disto.connect(disto500.input)
gains.disto.connect(disto1000.input)
gains.disto.connect(disto2000.input)
gains.disto.connect(disto4000.input)
disto500.output.connect(masterCompression)
disto1000.output.connect(masterCompression)
disto2000.output.connect(masterCompression)
disto4000.output.connect(masterCompression)
export default {
  input: gains.master,
  output: masterCompression,
}
