import './style.css'

// Simple counter example
let count = 0
const button = document.getElementById('counter-btn')

button.addEventListener('click', () => {
  count++
  button.textContent = `Count: ${count}`
})

console.log('App loaded and ready!')
