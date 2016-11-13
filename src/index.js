'use strict';

angular.module('distortion', []);

angular.module('distortion').controller('DistortionController', DistortionController);

function DistortionController () {
  var vm = this;

  //Config
  var equalizerFrequencies = [50, 100, 200, 400, 800, 1500, 3000, 5000, 7000, 10000, 15000];

  vm.sources = [
    {name: 'Guitare acoustique 1', url: './assets/acoustic.wav'},
    {name: 'Guitare acoustique 2', url: './assets/acoustic2.wav'},
    {name: 'Guitare acoustique 5', url: './assets/acoustic5.wav'},
    {name: 'Violon', url: './assets/violin.wav'}
  ];

  vm.gain = 50;
  vm.distortion = 0;
  vm.equalizer = {};
  //Creation du contexte audio
  var audioContext = new AudioContext();

  //Creation du noeud de gain
  var gainNode = audioContext.createGain();
  gainNode.gain.value = vm.gain / 100;

  vm.changeGain = function(value) {
    gainNode.gain.value = value / 100;
  };

  //Creation du noeud de distortion
  var distortionNode = audioContext.createWaveShaper();
  function makeDistortionCurve(amount) {
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
  distortionNode.curve = makeDistortionCurve(vm.distortion);
  distortionNode.oversample = '4x';

  vm.changeDistortion = function(value) {
    distortionNode.curve = makeDistortionCurve(parseInt(value));
  };

  //Creation des noeud de l'equalizer'
  var equalizerNodes = equalizerFrequencies.map(function(frequency) {
    var filterNode = audioContext.createBiquadFilter();
    filterNode.type = "peaking";
    filterNode.frequency.value = frequency;
    filterNode.gain.value = 0;
    vm.equalizer[frequency] = {
      node : filterNode,
      value: 0
    };
    return filterNode;
  });

  vm.changeEqualizer = function(value, node) {
    console.log('frequency', node.frequency.value, 'set to', value);
    node.gain.value = value;
  }

  /*
    Branchement des nodes :
    [source] => [gain] => [output]
  */

  var lastEqualizerNode = equalizerNodes.reduce(function(previousNode, frequency) {
    previousNode && previousNode.connect(frequency);
    return frequency;
  }, null);
  lastEqualizerNode.connect(distortionNode);
  distortionNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  //Creation de la source audio
  vm.changeSource = function(source) {
    if(vm.audioSource) {
      vm.sourceNode.disconnect(0);
    }
    vm.audioSource = new Audio(source);
    vm.audioSource.loop = true;
    vm.audioSource.play();

    vm.sourceNode = audioContext.createMediaElementSource(vm.audioSource);
    vm.sourceNode.connect(equalizerNodes[0]);
  };
}
