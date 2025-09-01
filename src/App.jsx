import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Passportfirstpage from './Passportfirstpage'
import Passportlastpage from './Passportlastpage'
import PassportScanner from './PassportScanner'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PassportForm from './components/PassportForm'
import AadhaarForm from './components/AadhaarForm'
import PanForm from './components/PanForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <div className="min-h-screen bg-gray-50">
        <PassportScanner />
        <Passportfirstpage />
        <Passportlastpage />
      </div> */}

      <Router>
        <Routes>
          <Route path="/" element={<PassportForm />} />
          <Route path="/aadhaar" element={<AadhaarForm />} />
          <Route path="/pan" element={<PanForm />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
