import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Passportfirstpage from './Passportfirstpage'
import Passportlastpage from './Passportlastpage'
import PassportScanner from './PassportScanner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <PassportScanner />
        {/* <Passportfirstpage /> */}
        <Passportlastpage />
      </div>
    </>
  )
}

export default App
