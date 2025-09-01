import React, { useState, useRef } from 'react'
import { Upload, ZoomIn, ZoomOut, RotateCw, X, Eye, EyeOff, FileText, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CombinedPassportForm = () => {
  const navigate = useNavigate()
  // Image states for both pages
  const [frontPageImage, setFrontPageImage] = useState(null)
  const [backPageImage, setBackPageImage] = useState(null)
  const [activeImageEditor, setActiveImageEditor] = useState(null) // 'front' or 'back'
  const [file, setFile] = useState(null)
  const [frontImageTransform, setFrontImageTransform] = useState({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  })
  const [backImageTransform, setBackImageTransform] = useState({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingPage, setProcessingPage] = useState('') // 'front' or 'back'

  // Form state for both pages
  const [frontPageData, setFrontPageData] = useState({
    passportNumber: '',
    firstName: '',
    lastName: '',
    nationality: '',
    sex: '',
    dateOfBirth: '',
    placeOfBirth: '',
    placeOfIssue: '',
    maritalStatus: '',
    dateOfIssue: '',
    dateOfExpiry: '',
  })

  const [backPageData, setBackPageData] = useState({
    fatherName: '',
    motherName: '',
    address: '',
  })

  const frontFileInputRef = useRef(null)
  const backFileInputRef = useRef(null)

  // Date conversion utility functions
  const convertDateToInputFormat = (dateString) => {
    if (!dateString) return ''
    
    // Check if already in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }
    
    // Handle DD/MM/YYYY format
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    
    // Handle other potential formats
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn('Could not parse date:', dateString)
    }
    
    return ''
  }

  const convertSexToFullWord = (sexCode) => {
    if (!sexCode) return ''
    
    const sexCodeUpper = sexCode.toString().toUpperCase()
    
    switch (sexCodeUpper) {
      case 'F':
        return 'Female'
      case 'M':
        return 'Male'
      case 'FEMALE':
        return 'Female'
      case 'MALE':
        return 'Male'
      default:
        return sexCode // Return original value if no conversion needed
    }
  }

  // COMMENTED OUT - REAL GEMINI API INTEGRATION FOR FRONT PAGE
  // const extractFrontPageText = async (imageBase64) => {
  //   if (!apiKey) {
  //     alert('Please enter your Gemini API key first');
  //     return;
  //   }

  //   setIsProcessing(true);
  //   setProcessingPage('front');
  //
  //   try {
  //     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         contents: [{
  //           parts: [
  //             {
  //               text: "Extract all information from this passport front page document and return it as a JSON object with the following fields: passportNumber, firstName, lastName, nationality, sex, dateOfBirth (in format YYYY-MM-DD), placeOfBirth, placeOfIssue, dateOfIssue (in format YYYY-MM-DD), dateOfExpiry (in format YYYY-MM-DD). Only return the JSON object, no other text."
  //             },
  //             {
  //               inline_data: {
  //                 mime_type: "image/jpeg",
  //                 data: imageBase64.split(',')[1]
  //               }
  //             }
  //           ]
  //         }]
  //       })
  //     });

  //     const data = await response.json();

  //     if (data.candidates && data.candidates[0] && data.candidates[0].content) {
  //       const extractedText = data.candidates[0].content.parts[0].text;

  //       try {
  //         const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
  //         if (jsonMatch) {
  //           const extractedData = JSON.parse(jsonMatch[0]);

  //           // Fill form fields (excluding maritalStatus)
  //           Object.keys(extractedData).forEach(key => {
  //             if (key !== 'maritalStatus' && frontPageData.hasOwnProperty(key)) {
  //               setFrontPageData(prev => ({ ...prev, [key]: extractedData[key] || '' }));
  //             }
  //           });

  //           alert('Front page passport information extracted successfully!');
  //         } else {
  //           throw new Error('No JSON found in response');
  //         }
  //       } catch (parseError) {
  //         console.error('Failed to parse front page data:', parseError);
  //         alert('Failed to parse front page information. Please check the image quality.');
  //       }
  //     } else {
  //       throw new Error('No content in API response');
  //     }
  //   } catch (error) {
  //     console.error('Error extracting front page text:', error);
  //     alert('Failed to extract front page information. Please check your API key and try again.');
  //   } finally {
  //     setIsProcessing(false);
  //     setProcessingPage('');
  //   }
  // };

  // COMMENTED OUT - REAL GEMINI API INTEGRATION FOR BACK PAGE
  // const extractBackPageText = async (imageBase64) => {
  //   if (!apiKey) {
  //     alert('Please enter your Gemini API key first');
  //     return;
  //   }

  //   setIsProcessing(true);
  //   setProcessingPage('back');
  //
  //   try {
  //     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         contents: [{
  //           parts: [
  //             {
  //               text: "Extract all information from this passport back page document and return it as a JSON object with the following fields: fatherName, motherName, address. Look for parent/guardian information and current address. Only return the JSON object, no other text."
  //             },
  //             {
  //               inline_data: {
  //                 mime_type: "image/jpeg",
  //                 data: imageBase64.split(',')[1]
  //               }
  //             }
  //           ]
  //         }]
  //       })
  //     });

  //     const data = await response.json();

  //     if (data.candidates && data.candidates[0] && data.candidates[0].content) {
  //       const extractedText = data.candidates[0].content.parts[0].text;

  //       try {
  //         const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
  //         if (jsonMatch) {
  //           const extractedData = JSON.parse(jsonMatch[0]);

  //           // Fill back page form fields
  //           Object.keys(extractedData).forEach(key => {
  //             if (backPageData.hasOwnProperty(key)) {
  //               setBackPageData(prev => ({ ...prev, [key]: extractedData[key] || '' }));
  //             }
  //           });

  //           alert('Back page passport information extracted successfully!');
  //         } else {
  //           throw new Error('No JSON found in response');
  //         }
  //       } catch (parseError) {
  //         console.error('Failed to parse back page data:', parseError);
  //         alert('Failed to parse back page information. Please check the image quality.');
  //       }
  //     } else {
  //       throw new Error('No content in API response');
  //     }
  //   } catch (error) {
  //     console.error('Error extracting back page text:', error);
  //     alert('Failed to extract back page information. Please check your API key and try again.');
  //   } finally {
  //     setIsProcessing(false);
  //     setProcessingPage('');
  //   }
  // };

  // Extract text from front page using mock data
  const extractFrontPageText = async (imageBase64) => {
    console.log('sss', imageBase64)

    setIsProcessing(true)
    setProcessingPage('front')

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // Mock extracted data for front page
      const mockFrontData = {
        passportNumber: 'U9151554',
        firstName: 'KAUSHAL',
        lastName: 'PATEL',
        nationality: 'India',
        sex: 'Male',
        dateOfBirth: '2000-04-10',
        placeOfBirth: 'AHMEDABAD GUJARAT',
        placeOfIssue: 'AHMEDABAD',
        dateOfIssue: '2021-03-03',
        dateOfExpiry: '2031-03-02',
      }

      setFrontPageData((prev) => ({ ...prev, ...mockFrontData }))
      alert('Front page information extracted successfully! (Using mock data for testing)')
    } catch (error) {
      console.error('Error with front page mock extraction:', error)
      alert('Failed to extract front page information.')
    } finally {
      setIsProcessing(false)
      setProcessingPage('')
    }
  }

  // Extract text from back page using mock data
  const extractBackPageText = async (imageBase64) => {
    setIsProcessing(true)
    setProcessingPage('back')

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // Mock extracted data for back page
      const mockBackData = {
        fatherName: 'SURESH PATEL',
        motherName: 'RITA PATEL',
        address: '123 MAIN STREET, AHMEDABAD, GUJARAT, INDIA - 380001',
      }

      setBackPageData(mockBackData)
      alert('Back page information extracted successfully! (Using mock data for testing)')
    } catch (error) {
      console.error('Error with back page mock extraction:', error)
      alert('Failed to extract back page information.')
    } finally {
      setIsProcessing(false)
      setProcessingPage('')
    }
  }

  // Handle front page input changes
  const handleFrontPageChange = (field, value) => {
    setFrontPageData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle back page input changes
  const handleBackPageChange = (field, value) => {
    setBackPageData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // returns yyyy-MM-dd
  };
  
  // Combined form submission
  const handleSubmit = () => {
    const combinedData = {
      frontPage: frontPageData,
      backPage: backPageData,
      submittedAt: new Date().toISOString(),
    }

    console.log('Combined Passport Data:', combinedData)

    // Show formatted data in alert for testing
    alert(
      `Form submitted successfully!\n\nFront Page Data:\n${JSON.stringify(
        frontPageData,
        null,
        2,
      )}\n\nBack Page Data:\n${JSON.stringify(backPageData, null, 2)}`,
    )
  }

  // File upload handlers
  const handleFrontPageUpload = (event) => {
    const file = event.target.files[0]
    setFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFrontPageImage(e.target.result)
        setActiveImageEditor('front')
        setFrontImageTransform({ scale: 1, rotation: 0, x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackPageUpload = (event) => {
    const file = event.target.files[0]
    setFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackPageImage(e.target.result)
        setActiveImageEditor('back')
        setBackImageTransform({ scale: 1, rotation: 0, x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  // Image transformation functions
  const handleZoomIn = (page) => {
    if (page === 'front') {
      setFrontImageTransform((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))
    } else {
      setBackImageTransform((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))
    }
  }

  const handleZoomOut = (page) => {
    if (page === 'front') {
      setFrontImageTransform((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))
    } else {
      setBackImageTransform((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.5) }))
    }
  }

  const handleRotate = (page) => {
    if (page === 'front') {
      setFrontImageTransform((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
    } else {
      setBackImageTransform((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
    }
  }

  // Process image functions
  const handleProcessFrontImage = async () => {
    setIsProcessing(true)
    setProcessingPage('front')

    const data = new FormData()
    data.append('image', file)

    if (file) {
      try {
        const response = await fetch('https://vercel-backend-976h.onrender.com/api/extract/passport/1', {
          method: 'POST',
          body: data,
        })

        const result = await response.json()

        console.log(result)

        // Convert dates to proper format and set form data
        setFrontPageData({
          passportNumber: result.data.passportNumber || '',
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
          nationality: result.data.nationality || '',
          sex: convertSexToFullWord(result.data.gender || ''),
          dateOfBirth: convertDateToInputFormat(result.data.dateOfBirth),
          placeOfBirth: result.data.placeOfBirth || '',
          placeOfIssue: result.data.passportIssuedState || '',
          maritalStatus: '', // Keep empty as it's not extracted
          dateOfIssue: convertDateToInputFormat(result.data.passportIssuedDate),
          dateOfExpiry: convertDateToInputFormat(result.data.passportExpiryDate),
        })

        alert('Front page passport information extracted successfully!')
        setActiveImageEditor(null)
      } catch (error) {
        console.error('Error extracting front page data:', error)
        alert('Failed to extract front page information. Please try again.')
      } finally {
        setIsProcessing(false)
        setProcessingPage('')
      }
    }
  }

  const handleProcessBackImage = async () => {
    if (backPageImage) {
      setIsProcessing(true)
      setProcessingPage('back')

      const data = new FormData()
      data.append('image', file)

      if (file) {
        try {
          const response = await fetch('https://vercel-backend-976h.onrender.com/api/extract/passport/2', {
            method: 'POST',
            body: data,
          })

          const result = await response.json()
          console.log('result', result)

          setBackPageData({
            fatherName: result.data.fatherName || '',
            motherName: result.data.motherName || '',
            address: result.data.address || '',
          })

          alert('Back page information extracted successfully!')
          setActiveImageEditor(null)
        } catch (error) {
          console.error('Error extracting back page data:', error)
          alert('Failed to extract back page information. Please try again.')
        } finally {
          setIsProcessing(false)
          setProcessingPage('')
        }
      }
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleFrontDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFrontPageImage(e.target.result)
        setActiveImageEditor('front')
        setFrontImageTransform({ scale: 1, rotation: 0, x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackPageImage(e.target.result)
        setActiveImageEditor('back')
        setBackImageTransform({ scale: 1, rotation: 0, x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  // Image upload components
  const ImageUploadSection = ({
    title,
    image,
    transform,
    onDrop,
    onUpload,
    onZoomIn,
    onZoomOut,
    onRotate,
    onProcess,
    onRemove,
    fileInputRef,
    isActive,
    pageType,
  }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileText size={20} />
        {title}
      </h3>

      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDrop={onDrop}
          className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-blue-400 mb-3" />
          <p className="text-gray-600 mb-2">Drag and drop files to upload</p>
          <p className="text-sm text-gray-500 mb-3">or</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Select file
          </button>
          <p className="text-xs text-gray-500 mt-3">Supports JPEG, JPG, PDF, PNG • Max 5MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={image}
              alt={`Uploaded ${pageType} page`}
              className="w-full h-48 object-contain"
              style={{
                transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) translate(${transform.x}px, ${transform.y}px)`,
              }}
            />
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {isActive && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Image Controls</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={onZoomIn}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ZoomIn size={16} />
                  Zoom In
                </button>
                <button
                  onClick={onZoomOut}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ZoomOut size={16} />
                  Zoom Out
                </button>
                <button
                  onClick={onRotate}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RotateCw size={16} />
                  Rotate
                </button>
              </div>
              <button
                onClick={onProcess}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing && processingPage === pageType ? 'Processing...' : `Extract ${pageType} Page Info`}
              </button>
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={onUpload} className="hidden" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Upload Traveler's Passport Pages</h1>
          </div>
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Front Page */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Camera size={24} />
                  Front Page
                </h2>

                {/* Front Page Image Upload */}
                <ImageUploadSection
                  title="Passport Front Page Image"
                  image={frontPageImage}
                  transform={frontImageTransform}
                  onDrop={handleFrontDrop}
                  onUpload={handleFrontPageUpload}
                  onZoomIn={() => handleZoomIn('front')}
                  onZoomOut={() => handleZoomOut('front')}
                  onRotate={() => handleRotate('front')}
                  onProcess={handleProcessFrontImage}
                  onRemove={() => {
                    setFrontPageImage(null)
                    setActiveImageEditor(null)
                  }}
                  fileInputRef={frontFileInputRef}
                  isActive={activeImageEditor === 'front'}
                  pageType="front"
                />

                {/* Front Page Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                    <input
                      type="text"
                      value={frontPageData.passportNumber}
                      onChange={(e) => handleFrontPageChange('passportNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter passport number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={frontPageData.firstName}
                        onChange={(e) => handleFrontPageChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={frontPageData.lastName}
                        onChange={(e) => handleFrontPageChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        value={frontPageData.nationality}
                        onChange={(e) => handleFrontPageChange('nationality', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nationality"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                      <select
                        value={frontPageData.sex}
                        onChange={(e) => handleFrontPageChange('sex', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={frontPageData.dateOfBirth}
                        onChange={(e) => handleFrontPageChange('dateOfBirth', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                    <input
                      type="text"
                      value={frontPageData.placeOfBirth}
                      onChange={(e) => handleFrontPageChange('placeOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Place of birth"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Issue</label>
                    <input
                      type="text"
                      value={frontPageData.placeOfIssue}
                      onChange={(e) => handleFrontPageChange('placeOfIssue', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Place of issue"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                      <select
                        value={frontPageData.maritalStatus}
                        onChange={(e) => handleFrontPageChange('maritalStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Issue</label>
                      <input
                        type="date"
                        value={frontPageData.dateOfIssue}
                        onChange={(e) => handleFrontPageChange('dateOfIssue', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Expiry</label>
                      <input
                        type="date"
                        value={frontPageData.dateOfExpiry}
                        onChange={(e) => handleFrontPageChange('dateOfExpiry', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Guardian Section */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="guardian"
                        checked={frontPageData.isGuardian}
                        onChange={(e) => handleFrontPageChange('isGuardian', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="guardian" className="text-sm font-medium text-gray-700">
                          This traveler will be a guardian of a child on this trip. Only the mother or father can be a
                          guardian.
                        </label>

                        {frontPageData.isGuardian && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children</label>
                            <select
                              value={frontPageData.numberOfChildren}
                              onChange={(e) => handleFrontPageChange('numberOfChildren', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select number of children</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5+">5+</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Back Page */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Camera size={24} />
                  Back Page
                </h2>

                {/* Back Page Image Upload */}
                <ImageUploadSection
                  title="Passport Back Page Image"
                  image={backPageImage}
                  transform={backImageTransform}
                  onDrop={handleBackDrop}
                  onUpload={handleBackPageUpload}
                  onZoomIn={() => handleZoomIn('back')}
                  onZoomOut={() => handleZoomOut('back')}
                  onRotate={() => handleRotate('back')}
                  onProcess={handleProcessBackImage}
                  onRemove={() => {
                    setBackPageImage(null)
                    setActiveImageEditor(null)
                  }}
                  fileInputRef={backFileInputRef}
                  isActive={activeImageEditor === 'back'}
                  pageType="back"
                />

                {/* Back Page Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                    <input
                      type="text"
                      value={backPageData.fatherName}
                      onChange={(e) => handleBackPageChange('fatherName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter father's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                    <input
                      type="text"
                      value={backPageData.motherName}
                      onChange={(e) => handleBackPageChange('motherName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter mother's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={backPageData.address}
                      onChange={(e) => handleBackPageChange('address', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Single Submit Button for Both Pages */}
            <div className="flex mt-8 gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/aadhaar')}
                className="btn btn-primary p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium text-lg shadow-lg"
              >
                Next
              </button>
              <button
                onClick={handleProcessFrontImage}
                type="submit"
                className="btn btn-secondary p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium text-lg shadow-lg"
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

export default CombinedPassportForm