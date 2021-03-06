'use strict';

angular.module('distortion', []);

angular.module('distortion').controller('DistortionController', DistortionController);

function DistortionController () {
  const vm = this;

  //Config
  const equalizerFrequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  vm.sources = [
    {name: 'LA3 sine', note: '440'},
    {name: 'Guitare acoustique 1', url: './assets/acoustic.wav'},
    {name: 'Guitare acoustique 2', url: './assets/acoustic2.wav'},
    {name: 'Guitare acoustique 5', url: './assets/acoustic5.wav'},
    {name: 'Violon', url: './assets/violin.wav'},
    {name: 'Microphone', microphone: true}
  ];

  vm.gain = 50;
  vm.reverb = 0;
  vm.distortion = 0;
  vm.equalizer = {};
  //Creation du contexte audio
  const audioContext = new AudioContext();

  //Creation du convolver
  const convolver = audioContext.createConvolver();
  const convolverGain = audioContext.createGain()
  const masterCompression = audioContext.createDynamicsCompressor()
  
  //Creation du noeud de gain
  const gainNode = audioContext.createGain();
  gainNode.gain.value = vm.gain / 100;

  vm.changeGain = function(value) {
    gainNode.gain.value = value / 100;
  };

  fetch('/assets/convolver.wav').then(res => res.arrayBuffer()).then(audioData => {
    audioContext.decodeAudioData(audioData, function(buffer) {
      const concertHallBuffer = buffer;
      convolver.buffer = concertHallBuffer
      convolver.loop = true
      convolver.normalize = true
      convolverGain.gain.value = 0
      convolverGain.connect(convolver)
      convolver.connect(gainNode)
      vm.changeReverb = (value) => {
        convolverGain.gain.value = value
      }
    }, function(e){"Error with decoding audio data" + e.err});
  })

  //Creation du noeud de distortion
  const distortionNode = audioContext.createWaveShaper();
  function makeDistortionCurve(amount) {
    let k = typeof amount === 'number' ? amount : 50,
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


  //Creation des noeud de l'equalizer'
  const equalizerNodes = equalizerFrequencies.map(function(frequency) {
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = "peaking";
    filterNode.frequency.value = frequency;
    filterNode.gain.value = 0;
    filterNode.Q.value = 5;
    // filterNode.detune.value = 20;
    vm.equalizer[frequency] = {
      node : filterNode,
      value: 0
    };
    return filterNode;
  });

  vm.changeDistortion = function(value) {
    const disto = parseInt(20 * (0 + (value/100)))
    const equalizerQ = 4.5 * (1 - (value/100)) + 0.5
    console.log('Disto set to', disto)
    console.log('EqualizeQ set to', equalizerQ)
    distortionNode.curve = makeDistortionCurve(disto)
    equalizerNodes.forEach(node => node.Q.value =  equalizerQ)
  };
  vm.changeEqualizer = function(value, node) {
    console.log('frequency', node.frequency.value, 'set to', value);
    node.gain.value = value;
  }

  // Analyser nodes Creation
  const analyserOsciloscope = audioContext.createAnalyser();
  analyserOsciloscope.fftSize = 2048;
  analyserOsciloscope.maxDecibels = 10;
  analyserOsciloscope.minDecibels = 0;
  window.analyserOsciloscope = analyserOsciloscope;

  const analyserSpectre = audioContext.createAnalyser();
  analyserSpectre.fftSize = 256;
  analyserOsciloscope.maxDecibels = 10;
  analyserOsciloscope.minDecibels = 0;

  /*
    Branchement des nodes :
    [source] => [gain] => [analyser pour oscilloscope] => [analyser pour spectrometre] => [output]
  */

  const lastEqualizerNode = equalizerNodes.reduce(function(previousNode, frequency) {
    previousNode && previousNode.connect(frequency);
    return frequency;
  }, null);
  lastEqualizerNode.connect(gainNode);
  lastEqualizerNode.connect(convolverGain);
  gainNode.connect(masterCompression)
  masterCompression.connect(distortionNode)
  distortionNode.connect(analyserOsciloscope);
  analyserOsciloscope.connect(analyserSpectre);
  analyserSpectre.connect(audioContext.destination);

  //Creation de la source audio
  vm.changeSource = function(sourceName) {
    const source = vm.sources.find(s => s.name === sourceName);

    var promise
    if(vm.audioSource) {
      vm.sourceNode.disconnect(0);
    }
    if(source.url) {
      vm.audioSource = new Audio(source.url);
      vm.audioSource.loop = true;
      vm.audioSource.play();
      vm.sourceNode = audioContext.createMediaElementSource(vm.audioSource);
      promise = Promise.resolve(vm.sourceNode)
    }
    else if (source.note) {
      vm.sourceNode = audioContext.createOscillator();
      vm.sourceNode.start(audioContext.currentTime)
      promise = Promise.resolve(vm.sourceNode);
    } else if (source.microphone) {
      var promise = vm.getMicrophoneStream().then(function(stream){
        vm.audioSource = stream;
        vm.sourceNode = audioContext.createMediaStreamSource(stream);
        return vm.sourceNode
      })
    }
    promise.then(sourceNode => {
      sourceNode.connect(equalizerNodes[0]);
    })
  };

  vm.getMicrophoneStream = function() {
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);
    return new Promise(function(resolve, reject){
      navigator.getUserMedia({audio:true},
        function(medias){
          resolve(medias);
        },function(error){
          reject(error);
        })
    });
  }

  // Osciloscope managment
  const osciloscope = document.getElementById('oscilloscope');
  const osciloCtx = osciloscope.getContext('2d');
  const bufferLength = analyserOsciloscope.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function drawOsciloscope() {
      requestAnimationFrame(drawOsciloscope);
      osciloCtx.fillStyle = 'rgb(0, 0, 0)';
      osciloCtx.fillRect(0, 0, osciloscope.width, osciloscope.height);
      osciloCtx.lineWidth = 2;
      osciloCtx.strokeStyle = 'rgb(200, 50, 50)';

      analyserOsciloscope.getByteTimeDomainData(dataArray);

      osciloCtx.beginPath();

      const sliceWidth = osciloscope.width * 1.0 / bufferLength;
      let x = 0;
      for(let i = 0; i < bufferLength; i++) {
        const y = (dataArray[i] / 128.0) * (osciloscope.height / 2);

        if(i === 0) { osciloCtx.moveTo(x, y); }
        else { osciloCtx.lineTo(x, y); }

        x += sliceWidth;
      }
      osciloCtx.stroke();
  }
  drawOsciloscope();

  // Spectrometre managment
  const spectre = document.getElementById('spectre');
  const spectreCtx = spectre.getContext('2d');
  const bufferSpectreLength = analyserSpectre.frequencyBinCount;
  const dataSpectreArray = new Uint8Array(bufferSpectreLength);

  function drawSpectre() {
    requestAnimationFrame(drawSpectre);

    analyserSpectre.getByteFrequencyData(dataSpectreArray);

    spectreCtx.fillStyle = 'rgb(0, 0, 0)';
    spectreCtx.fillRect(0, 0, spectre.width, spectre.height);

    const lBarre = Math.floor((spectre.width / bufferSpectreLength) * 2.5);

    let x = 0;
    for(let i = 0; i < bufferSpectreLength; i++) {
      let hBarre = dataSpectreArray[i] /1.5;

      spectreCtx.fillStyle = 'rgb(200,50,50)';
      spectreCtx.fillRect(x, spectre.height - hBarre / 1.5, lBarre, hBarre);

      x += lBarre + 1;
    }
  }
  drawSpectre();
}
