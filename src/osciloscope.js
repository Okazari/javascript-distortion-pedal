import audioContext from './audioContext'

const osciloscope = document.getElementById('oscilloscope');
const osciloCtx = osciloscope.getContext('2d');

function drawOsciloscope() {
    requestAnimationFrame(drawOsciloscope);
    osciloCtx.fillStyle = 'rgb(0, 0, 0)';
    osciloCtx.fillRect(0, 0, osciloscope.width, osciloscope.height);
    osciloCtx.lineWidth = 2;
    osciloCtx.strokeStyle = '#ABDCF6';


    osciloCtx.beginPath();
    let x = 0;
    let y = osciloscope.height / 2;
    osciloCtx.moveTo(x, y);

    x = osciloscope.width;
    osciloCtx.lineTo(x, y);

    osciloCtx.stroke();
}
drawOsciloscope();

export default analyserOsciloscope
