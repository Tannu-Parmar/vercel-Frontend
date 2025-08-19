import React, { useState, useCallback, useRef } from 'react'
import { Upload, Camera, ZoomIn, ZoomOut, RotateCcw, Check, Eye, Loader2, User, MapPin } from 'lucide-react'

// 🧠 Reuse OCR logic
// Make sure to reuse or import processWithGoogleVision & parsePassportText from your existing utilities

const PassportGuardianForm = () => {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [cropMode, setCropMode] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [ocrResults, setOcrResults] = useState(null)
  const [processingStatus, setProcessingStatus] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    motherName: '',
    fatherName: '',
    address: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const files = Array.from(e.dataTransfer.files)
      if (files && files[0]) {
        await handleFileUpload(files[0])
      }
    },
    [apiKey],
  )

  const handleFileUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (!apiKey.trim()) {
      alert('Please enter your Google Cloud Vision API key first')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      setUploadedImage(e.target.result)
      setIsProcessing(true)
      setProcessingStatus('Processing...')

      try {
        // Replace with your existing OCR logic
        const extractedData = await processWithGoogleVision(e.target.result, apiKey)
        setOcrResults(extractedData)
        setProcessingStatus('OCR complete.')
      } catch (error) {
        console.error('OCR failed:', error)
        setProcessingStatus(`Error: ${error.message}`)
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    console.log('Submitted Data:', {
      ...formData,
      ocrResults,
    })
    alert('Data submitted. Check console.')
    setFormData({ motherName: '', fatherName: '', address: '' })
    setUploadedImage(null)
    setOcrResults(null)
    setZoom(1)
    setProcessingStatus('')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Traveler's Back Passport Page</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section: Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Passport Back Image
          </h2>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedImage ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
                    style={{ transform: `scale(${zoom})` }}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">{processingStatus}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCropMode(!cropMode)}>
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setUploadedImage(null)
                      setZoom(1)
                      setCropMode(false)
                      setOcrResults(null)
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                    <p className="text-lg text-gray-600 mb-2">Drag and drop files to upload</p>
                    <p className="text-gray-500 mb-4">or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      // disabled={!apiKey.trim()}
                    >
                      Select file
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, JPG, PNG.<br />
                    Max file size 5MB
                  </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0])
                }
              }}
            />
          </div>

          {processingStatus && !isProcessing && <div className="p-2 text-blue-700 text-sm">{processingStatus}</div>}
        </div>

        {/* Right Section: Form */}
        <div className="mt-10 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Mother Name
            </label>
            <input
              name="motherName"
              value={formData.motherName}
              onChange={handleInputChange}
              placeholder="Enter mother's name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Father Name
            </label>
            <input
              name="fatherName"
              value={formData.fatherName}
              onChange={handleInputChange}
              placeholder="Enter father's name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* Submit Button */}
      <div className="flex justify-end mt-10">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-4 h-4" />
          {isProcessing ? 'Processing...' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}

export default PassportGuardianForm
