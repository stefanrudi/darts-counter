import { useState } from 'react'
import Dartboard from './components/dartboard'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Dartboard/>
      </div>
    </>
  )
}

export default App
