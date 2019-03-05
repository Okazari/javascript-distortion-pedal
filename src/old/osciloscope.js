  import audioContext from './audioContext'

  const analyserOsciloscope = audioContext.createAnalyser();
  analyserOsciloscope.fftSize = 2048;
  analyserOsciloscope.maxDecibels = 10;
  analyserOsciloscope.minDecibels = 0;

  const osciloscope = document.getElementById('oscilloscope');
  const osciloCtx = osciloscope.getContext('2d');
  const bufferLength = analyserOsciloscope.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function drawOsciloscope() {
      requestAnimationFrame(drawOsciloscope);
      osciloCtx.fillStyle = 'rgb(0, 0, 0)';
      osciloCtx.fillRect(0, 0, osciloscope.width, osciloscope.height);
      osciloCtx.lineWidth = 2;
      osciloCtx.strokeStyle = '#ABDCF6';

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

  export default analyserOsciloscope
