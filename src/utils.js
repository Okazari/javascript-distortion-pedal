export const addController = (name, min, max, step, initial, onChange) => {
  const container = document.createElement('div')
  const label = document.createElement('label')
  label.innerText = name
  const input = document.createElement('input')
  input.type = "range"
  input.min = min
  input.max = max
  input.step = step
  input.value = initial
  input.addEventListener('change', (bla) => {
    onChange(bla.target.value)
  })
  input.addEventListener('mousemove', (bla) => {
    onChange(bla.target.value)
  })
  container.appendChild(label)
  container.appendChild(input)
  document.getElementById('container').appendChild(container)
}

export const connectPlayButton = (audioSource) => {
  const playButton = document.getElementById('play')
  let playing = false
  playButton.addEventListener('click', () => {
    if(!playing){
      playing = true
      audioSource.play()
      playButton.innerText = 'Stop'
    } else {
      playing = false
      audioSource.pause()
      audioSource.currentTime = 0
      playButton.innerText = 'Play'
    }
  })
}


let x

export const initCanva = (context, elem) => {
  context.fillStyle = 'rgb(0, 0, 0)'
  context.fillRect(0, 0, elem.width, elem.height)
  context.fillStyle = '#ABDCF6'
  x = 0
}

export const addBar = (context, elem, width, height) => {
  context.fillRect(x, elem.height - height / 1.5, width, height)
  x += width + 1
}
