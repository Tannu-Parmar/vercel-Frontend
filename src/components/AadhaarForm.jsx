import React, { useState, useRef } from 'react'
import { Upload, ZoomIn, ZoomOut, RotateCw, X, Eye, EyeOff, FileText, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SimpleAadhaarForm = () => {
  const navigate = useNavigate()
  // Image state for front page only
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageTransform, setImageTransform] = useState({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [file, setFile] = useState(null)

  // Form state - only two fields
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    nameAsPerAadhaar: '',
  })

  const fileInputRef = useRef(null)

  // Extract text from image using mock data (API commented out for testing)
  const extractTextFromImage = async (imageBase64) => {
    console.log('sss', imageBase64)
    setIsProcessing(true)

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // Mock extracted data for testing
      const mockExtractedData = {
        aadhaarNumber: '1234 5678 9012',
        nameAsPerAadhaar: 'KAUSHAL SURESH PATEL',
      }

      // Fill form fields
      setFormData(mockExtractedData)

      alert('Aadhaar card information extracted successfully! (Using mock data for testing)')
    } catch (error) {
      console.error('Error with mock extraction:', error)
      alert('Failed to extract Aadhaar card information.')
    } finally {
      setIsProcessing(false)
    }

    /* COMMENTED OUT - REAL GEMINI API INTEGRATION
    if (!apiKey) {
      alert('Please enter your Gemini API key first');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Extract all information from this Aadhaar card document and return it as a JSON object with the following fields: aadhaarNumber, nameAsPerAadhaar. Only return the JSON object, no other text."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.split(',')[1]
                }
              }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const extractedText = data.candidates[0].content.parts[0].text;
        
        try {
          const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedData = JSON.parse(jsonMatch[0]);
            setFormData(extractedData);
            alert('Aadhaar card information extracted successfully!');
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse extracted data:', parseError);
          alert('Failed to parse Aadhaar card information. Please check the image quality.');
        }
      } else {
        throw new Error('No content in API response');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Failed to extract Aadhaar card information. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
    */
  }

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = () => {
    const submissionData = {
      ...formData,
      submittedAt: new Date().toISOString(),
    }

    console.log('Aadhaar Form submitted:', submissionData)
    alert(`Aadhaar form submitted successfully!\n\nData:\n${JSON.stringify(formData, null, 2)}`)
  }

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    setFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setShowImageEditor(true)
        setImageTransform({ scale: 1, rotation: 0, x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  // Image transformation functions
  const handleZoomIn = () => {
    setImageTransform((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))
  }

  const handleZoomOut = () => {
    setImageTransform((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))
  }

  const handleRotate = () => {
    setImageTransform((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
  }

   // Process image functions
  // const handleProcessImage = async () => {
  //   if (uploadedImage) {
  //     await extractTextFromImage(uploadedImage)
  //     setShowImageEditor(false)
  //   }
  // }

  const handleProcessImage = async () => {
    setIsProcessing(true)
    // setProcessingPage('front')

    const data = new FormData()
    data.append('image', file)

    if (file) {
      try {
        const response = await fetch('http://localhost:3001/api/extract/aadhaar/1', {
          method: 'POST',
          body: data,
        })

        const result = await response.json()

        // console.log(result)

        // Convert dates to proper format and set form data
        setFormData({
          aadhaarNumber: result.data.aadhaarNumber || '',
          nameAsPerAadhaar: result.data.name || '',
        })

        alert('Front page passport information extracted successfully!')
        setUploadedImage(null)
      } catch (error) {
        console.error('Error extracting front page data:', error)
        alert('Failed to extract front page information. Please try again.')
      } finally {
        setIsProcessing(false)
        // setProcessingPage('')
      }
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setShowImageEditor(true)
        setImageTransform({ scale: 1, rotation: 0, x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Upload Aadhaar Card</h1>
          </div>

          <div className="p-8">
            {/* API Key Input - Hidden for testing */}
            <div className="hidden mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Gemini API Configuration</h3>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-600 hover:text-yellow-800"
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Get your API key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Image Upload */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Aadhaar Card Front Page Image</h3>

                {!uploadedImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                    <p className="text-lg text-gray-600 mb-2">Drag and drop files to upload</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Select file
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      Supports JPEG, JPG, PDF, PNG
                      <br />
                      Max file size 5MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={uploadedImage}
                        alt="Uploaded Aadhaar card"
                        className="w-full h-64 object-contain"
                        style={{
                          transform: `scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg) translate(${imageTransform.x}px, ${imageTransform.y}px)`,
                        }}
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null)
                          setShowImageEditor(false)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {showImageEditor && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-3">Image Controls</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <button
                            onClick={handleZoomIn}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ZoomIn size={16} />
                            Zoom In
                          </button>
                          <button
                            onClick={handleZoomOut}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ZoomOut size={16} />
                            Zoom Out
                          </button>
                          <button
                            onClick={handleRotate}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <RotateCw size={16} />
                            Rotate
                          </button>
                        </div>
                        <button
                          onClick={handleProcessImage}
                          disabled={isProcessing}
                          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Extract Information (Mock Data)'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Right Column - Form Fields */}
              <div>
                <div className="space-y-6 mt-10">
                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Aadhaar number"
                    />
                  </div>

                  {/* Name as per Aadhaar Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name as per Aadhaar Card</label>
                    <input
                      type="text"
                      value={formData.nameAsPerAadhaar}
                      onChange={(e) => handleInputChange('nameAsPerAadhaar', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name as per Aadhaar card"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex mt-6 gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium text-lg shadow-lg"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => navigate('/pan')}
                className="btn btn-primary p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium text-lg shadow-lg"
              >
                Next
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-accent p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium text-lg shadow-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleAadhaarForm
