import React, { useState, useRef } from 'react'
import { Upload, Volume2, Crop, ZoomIn, RotateCw, Move } from 'lucide-react'

const PassportUploadForm = () => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [formData, setFormData] = useState({
    passportNumber: '',
    firstName: '',
    lastName: '',
    nationality: 'Select...',
    sex: 'Select...',
    dateOfBirth: '',
    placeOfBirth: '',
    placeOfIssue: '',
    maritalStatus: 'Select...',
    dateOfIssue: '',
    dateOfExpiry: '',
    isGuardian: false,
    numberOfChildren: 'Select an item',
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Mock OCR data - in real app this would come from OCR service
  const mockOCRData = {
    passportNumber: 'U9151554',
    firstName: 'KAUSHAL SURESH',
    lastName: 'PATEL',
    nationality: 'India',
    sex: 'Male',
    dateOfBirth: 'Apr 10, 2000',
    placeOfBirth: 'AHMEDABAD GUJARAT',
    placeOfIssue: 'AHMEDABAD',
    maritalStatus: 'Single',
    dateOfIssue: 'Mar 3, 2021',
    dateOfExpiry: 'Mar 2, 2031',
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = (file) => {
    // Simulate file upload and OCR processing
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedFile(e.target.result)
      setShowImageEditor(true)
      // Simulate OCR delay
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          ...mockOCRData,
        }))
      }, 1000)
    }
    reader.readAsDataURL(file)
  }

  const handleImageMouseDown = (e) => {
    if (showImageEditor) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      })
    }
  }

  const handleImageMouseMove = (e) => {
    if (isDragging && showImageEditor) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleImageMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleRotate = () => {
    // Rotation functionality would be implemented here
    console.log('Rotate image')
  }

  const handleCrop = () => {
    // Crop functionality would be implemented here
    console.log('Crop image')
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    console.log('=== FRONT PAGE PASSPORT DETAILS ===')
    console.log('Passport Number:', formData.passportNumber)
    console.log('First Name:', formData.firstName)
    console.log('Last Name:', formData.lastName)
    console.log('Nationality:', formData.nationality)
    console.log('Sex:', formData.sex)
    console.log('Date of Birth:', formData.dateOfBirth)
    console.log('Place of Birth:', formData.placeOfBirth)
    console.log('Place of Issue:', formData.placeOfIssue)
    console.log('Marital Status:', formData.maritalStatus)
    console.log('Date of Issue:', formData.dateOfIssue)
    console.log('Date of Expiry:', formData.dateOfExpiry)
    console.log('Is Guardian:', formData.isGuardian)
    console.log('Number of Children:', formData.numberOfChildren)
    console.log('Uploaded File:', uploadedFile ? 'File uploaded' : 'No file')
    console.log('=====================================')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Upload Front Passport Page</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <input type="file" accept="image/*" onChange={handleImageUpload} />

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passport Front Page Image <span className="text-red-500">*</span>
          </label>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : uploadedFile
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded border bg-white">
                  <img
                    src={uploadedFile}
                    alt="Uploaded passport"
                    className={`max-w-full transition-transform duration-200 ${showImageEditor ? 'cursor-move' : ''}`}
                    style={{
                      transform: showImageEditor
                        ? `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`
                        : 'none',
                      maxHeight: '300px',
                    }}
                    onMouseDown={handleImageMouseDown}
                    onMouseMove={handleImageMouseMove}
                    onMouseUp={handleImageMouseUp}
                    onMouseLeave={handleImageMouseUp}
                    draggable={false}
                  />

                  {/* Image Controls Overlay */}
                  {showImageEditor && (
                    <div className="absolute top-2 left-2 flex flex-col space-y-2">
                      <button
                        onClick={handleZoomIn}
                        className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-sm"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={handleZoomOut}
                        className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-sm"
                        title="Zoom Out"
                      >
                        <span className="text-gray-600 text-xs font-bold">-</span>
                      </button>
                      <button
                        onClick={handleRotate}
                        className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-sm"
                        title="Rotate"
                      >
                        <RotateCw className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={handleCrop}
                        className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-sm"
                        title="Crop"
                      >
                        <Crop className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}

                  {/* Move cursor indicator */}
                  {showImageEditor && (
                    <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-600 shadow-sm flex items-center space-x-1">
                      <Move className="w-3 h-3" />
                      <span>Drag to move</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 underline text-sm">
                    Change file
                  </button>
                  {showImageEditor && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Zoom: {Math.round(imageScale * 100)}%</span>
                      <span>•</span>
                      <span>Click and drag to reposition</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 mb-2">Drag and drop files to upload</p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select file
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Supports JPEG, JPG, PDF, PNG.
                  <br />
                  Max file size 5MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpeg,.jpg,.pdf,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="mt-8 flex">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Submit
            </button>
          </div>

        </div>

        {/* Form Fields Section */}
        <div className="space-y-4">
          {/* Passport Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport Number <Volume2 className="inline w-4 h-4 ml-1 text-gray-400" />{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) => handleInputChange('passportNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Nationality, Sex, Date of Birth */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Select...</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Canada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Select...</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                placeholder="Select date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Place of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Place of Issue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place of Issue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.placeOfIssue}
              onChange={(e) => handleInputChange('placeOfIssue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Marital Status and Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Select...</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
                <option>Civil</option>
                <option>Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Issue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dateOfIssue}
                onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                placeholder="Select date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Expiry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dateOfExpiry}
                onChange={(e) => handleInputChange('dateOfExpiry', e.target.value)}
                placeholder="Select date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Guardian Checkbox */}
          <div className="flex items-start space-x-3 mt-6">
            <input
              type="checkbox"
              id="guardian"
              checked={formData.isGuardian}
              onChange={(e) => handleInputChange('isGuardian', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="guardian" className="text-sm text-gray-700">
              This traveler will be a guardian of a child on this trip. Only the mother or father can be a guardian.
            </label>
            {formData.isGuardian && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                <select
                  value={formData.numberOfChildren}
                  onChange={(e) => handleInputChange('numberOfChildren', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option>Select an item</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6</option>
                  <option>7</option>
                  <option>8</option>
                  <option>9</option>
                  <option>10</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {/* <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Submit Front Page Details
        </button>
      </div> */}
    </div>
  )
}

export default PassportUploadForm
