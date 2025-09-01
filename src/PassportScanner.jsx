import React, { useState, useCallback, useRef } from 'react';
import { Upload, Camera, ZoomIn, ZoomOut, RotateCcw, Check, AlertCircle, User, MapPin, Calendar, Hash, Users, Eye, Loader2 } from 'lucide-react';

// Simulated Formik and Yup functionality
const useFormik = (config) => {
  const [values, setValues] = useState(config.initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, values[name]);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'passportNumber':
        if (!value) return 'Passport number is required';
        if (!/^[A-Z]\d{7,9}$/.test(value)) return 'Must match valid passport number pattern';
        return '';
      case 'firstName':
        if (!value) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      case 'lastName':
        if (!value) return 'Last name is required';
        return '';
      case 'nationality':
        if (!value) return 'Nationality is required';
        return '';
      case 'sex':
        if (!value) return 'Sex is required';
        return '';
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        return '';
      case 'placeOfBirth':
        if (!value) return 'Place of birth is required';
        return '';
      case 'placeOfIssue':
        if (!value) return 'Place of issue is required';
        return '';
      case 'maritalStatus':
        if (!value) return 'Marital status is required';
        return '';
      case 'dateOfIssue':
        if (!value) return 'Date of issue is required';
        return '';
      case 'dateOfExpiry':
        if (!value) return 'Date of expiry is required';
        return '';
      default:
        return '';
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const newErrors = {};
  //   Object.keys(values).forEach(key => {
  //     const error = validateField(key, values[key]);
  //     if (error) newErrors[key] = error;
  //   });
    
  //   setErrors(newErrors);
  //   setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
  //   if (Object.keys(newErrors).length === 0) {
  //     config.onSubmit(values);
  //   }
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
  
    // Validate all fields
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) newErrors[key] = error;
    });
  
    // Update errors and touched state
    setErrors(newErrors);
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
  
    // If no errors, submit the form and reset the values
    if (Object.keys(newErrors).length === 0) {
      config.onSubmit(values);
  
      // Clear the form after successful submit
      const clearedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = ""; // or null, depending on field type
        return acc;
      }, {});
  
      setValues(clearedValues);
    }
  };
  

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  };
};

// Google Cloud Vision API OCR function 
const processWithGoogleVision = async (imageBase64, apiKey) => {
  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apikey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
            },
            features: [
              { type: 'TEXT_DETECTION', maxResults: 10 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 10 }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.responses && result.responses[0]) {
      const textAnnotations = result.responses[0].textAnnotations;
      const fullText = textAnnotations && textAnnotations[0] ? textAnnotations[0].description : '';
      
      return parsePassportText(fullText);
    }
    
    throw new Error('No text detected in image');
  } catch (error) {
    console.error('Google Vision API Error:', error);
    throw error;
  }
};

// Advanced passport text parsing function  
const parsePassportText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const extractedData = {};

  // Patterns for different passport data 
  const patterns = {
    passportNumber: /^[A-Z]\d{7,9}$/,
    mrzLine: /^P<[A-Z]{3}[A-Z<]+<<[A-Z<]+$/,
    datePattern: /\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b/,
    namePattern: /^[A-Z][A-Z\s]+$/,
    nationality: /^(INDIA|INDIAN|USA|AMERICAN|UK|BRITISH|CANADA|CANADIAN|AUSTRALIA|AUSTRALIAN)$/i
  };

  // Extract passport number 
  for (const line of lines) {
    if (patterns.passportNumber.test(line)) {
      extractedData.passportNumber = line;
      break;
    }
  }

  // Extract names and other data from MRZ (Machine Readable Zone)  
  const mrzLine = lines.find(line => patterns.mrzLine.test(line));
  if (mrzLine) {
    const mrzParts = mrzLine.split('<<');
    if (mrzParts.length >= 2) {
      const lastName = mrzParts[0].replace('P<', '').replace(/[^A-Z]/g, '');
      const firstNamePart = mrzParts[1].replace(/</g, ' ').trim();
      
      extractedData.lastName = lastName;
      extractedData.firstName = firstNamePart;
    }
  }

  // Extract dates 
  const dates = [];
  for (const line of lines) {
    const dateMatch = line.match(patterns.datePattern);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      dates.push(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  }

  // Assign dates based on context and logic 
  if (dates.length >= 2) {
    // Usually birth date comes first, then issue date, then expiry date
    const sortedDates = dates.sort();
    extractedData.dateOfBirth = sortedDates[0];
    if (dates.length >= 3) {
      extractedData.dateOfIssue = sortedDates[1];
      extractedData.dateOfExpiry = sortedDates[2];
    } else {
      extractedData.dateOfExpiry = sortedDates[1];
    }
  }

  // Extract nationality 
  for (const line of lines) {
    if (patterns.nationality.test(line)) {
      const nationality = line.toUpperCase();
      if (nationality.includes('INDIA')) extractedData.nationality = 'India';
      else if (nationality.includes('USA') || nationality.includes('AMERICAN')) extractedData.nationality = 'USA';
      else if (nationality.includes('UK') || nationality.includes('BRITISH')) extractedData.nationality = 'UK';
      else if (nationality.includes('CANADA')) extractedData.nationality = 'Canada';
      else if (nationality.includes('AUSTRALIA')) extractedData.nationality = 'Australia';
      break;
    }
  }

  // Extract sex from common indicators 
  const sexIndicators = ['MALE', 'FEMALE', 'M', 'F'];
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    for (const indicator of sexIndicators) {
      if (upperLine.includes(indicator)) {
        extractedData.sex = indicator === 'M' || indicator === 'MALE' ? 'Male' : 'Female';
        break;
      }
    }
    if (extractedData.sex) break;
  }

  // Extract place information (look for common place patterns)
  const placeKeywords = ['BORN', 'BIRTH', 'ISSUED', 'PLACE'];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    for (const keyword of placeKeywords) {
      if (line.includes(keyword) && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (keyword.includes('BIRTH') || keyword.includes('BORN')) {
          extractedData.placeOfBirth = nextLine.toUpperCase();
        } else if (keyword.includes('ISSUED')) {
          extractedData.placeOfIssue = nextLine.toUpperCase();
        }
      }
    }
  }

  return extractedData;
};

const PassportForm = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isGuardian, setIsGuardian] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
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
      numberOfChildren: ''
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      alert('Form submitted successfully!');
    }
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      await handleFileUpload(files[0]);
    }
  }, [apiKey]);

  const handleFileUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (!apiKey.trim()) {
      alert('Please enter your Google Cloud Vision API key first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploadedImage(e.target.result);
      setIsProcessing(true);
      setProcessingStatus('Uploading image...');
      
      try {
        setProcessingStatus('Analyzing document with Google Vision AI...');
        
        // Process with Google Cloud Vision API
        const extractedData = await processWithGoogleVision(e.target.result, apiKey);
        
        setProcessingStatus('Parsing extracted text...');
        
        // Store OCR results for display
        setOcrResults(extractedData);
        
        // Auto-fill form with extracted data
        formik.setValues(prev => ({
          ...prev,
          ...extractedData
        }));
        
        setProcessingStatus('Complete! Form auto-filled with extracted data.');
        setTimeout(() => setProcessingStatus(''), 3000);
        
      } catch (error) {
        console.error('OCR processing failed:', error);
        setProcessingStatus(`Error: ${error.message}`);
        alert(`OCR Processing failed: ${error.message}\n\nPlease check your API key and try again.`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const InputField = ({ name, label, type = "text", required = false, icon: Icon }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
          formik.errors[name] && formik.touched[name] 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300'
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {formik.errors[name] && formik.touched[name] && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {formik.errors[name]}
        </div>
      )}
    </div>
  );

  const SelectField = ({ name, label, options, required = false, icon: Icon }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
          formik.errors[name] && formik.touched[name] 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300'
        }`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {formik.errors[name] && formik.touched[name] && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {formik.errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Traveler's Front Passport Page</h1>
      </div>

      {/* API Key Input */}
      {/* <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Google Cloud Vision API Configuration</h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Cloud Vision API Key"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Get your API key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>
        </p>
      </div> */}

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Passport Front Page Image 
            </h2>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
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
                      alt="Uploaded passport" 
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
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isProcessing}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isProcessing}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropMode(!cropMode)}
                      className={`p-2 rounded-lg transition-colors ${
                        cropMode 
                          ? 'text-blue-600 bg-blue-100' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                      disabled={isProcessing}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setZoom(1);
                        setCropMode(false);
                        setOcrResults(null);
                        setProcessingStatus('');
                      }}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isProcessing}
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
                  {/* {!apiKey.trim() && (
                    <p className="text-sm text-red-500">
                      Please enter your Google Vision API key above
                    </p>
                  )} */}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* OCR Results Display */}
            {ocrResults && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-2">✅ Extracted Data from Passport:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  {Object.entries(ocrResults).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span>{value || 'Not detected'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processingStatus && !isProcessing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">{processingStatus}</p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="mt-10 space-y-6">
            <InputField 
              name="passportNumber" 
              label="Passport Number"
              required 
              icon={Hash}
              formik={formik} // Pass formik here
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                name="firstName" 
                label="First Name" 
                required 
                icon={User}
              />
              <InputField 
                name="lastName" 
                label="Last Name" 
                required 
                icon={User}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <SelectField 
                name="nationality"
                label="Nationality"
                options={['India', 'USA', 'UK', 'Canada', 'Australia']}
                required
                icon={MapPin}
              />
              <SelectField 
                name="sex"
                label="Sex"
                options={['Male', 'Female', 'Other']}
                required
                icon={User}
              />
              <InputField 
                name="dateOfBirth" 
                label="Date of Birth" 
                type="date" 
                required 
                icon={Calendar}
              />
            </div>

            <InputField 
              name="placeOfBirth" 
              label="Place of Birth" 
              required 
              icon={MapPin}
            />
            
            <InputField 
              name="placeOfIssue" 
              label="Place of Issue" 
              required 
              icon={MapPin}
            />

            <div className="grid grid-cols-3 gap-4">
              <SelectField 
                name="maritalStatus"
                label="Marital Status"
                options={['Single', 'Married', 'Divorced', 'Widowed']}
                required
                icon={User}
              />
              <InputField 
                name="dateOfIssue" 
                label="Date of Issue" 
                type="date" 
                required 
                icon={Calendar}
              />
              <InputField 
                name="dateOfExpiry" 
                label="Date of Expiry" 
                type="date" 
                required 
                icon={Calendar}
              />
            </div>

            {/* Guardian Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="guardian"
                  checked={isGuardian}
                  onChange={(e) => setIsGuardian(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="guardian" className="text-sm text-gray-700">
                  This traveler will be a guardian of a child on this trip. Only the mother or father can be a guardian.
                </label>
              </div>
              
              {isGuardian && (
                <SelectField 
                  name="numberOfChildren"
                  label="Number of Children"
                  options={['1', '2', '3', '4', '5+']}
                  icon={Users}
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassportForm;