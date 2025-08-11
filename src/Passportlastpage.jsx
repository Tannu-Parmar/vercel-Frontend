import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
  
const PassportScannerForm = () => {
  // To use real Tesseract OCR, add this script to your HTML head:
  // <script src="https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js"></script>
  
  const [formData, setFormData] = useState({
    fatherName: '',
    motherName: '',
    address: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [status, setStatus] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const fileInputRef = useRef(null);

  // MRZ parsing function
  const parseMRZ = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for MRZ lines (typically start with P< for passport)
    const mrzLines = lines.filter(line => 
      line.startsWith('P<') || 
      line.match(/^[A-Z0-9<]{44}$/) || 
      line.match(/^[A-Z0-9<]{36}$/)
    );
    
    if (mrzLines.length >= 2) {
      const line1 = mrzLines[0];
      const line2 = mrzLines[1];
      
      // Parse first line: P<COUNTRY_CODE<SURNAME<<GIVEN_NAMES
      const countryMatch = line1.match(/^P<([A-Z]{3})/);
      const nameMatch = line1.match(/P<[A-Z]{3}([A-Z<]+)$/);
      
      if (nameMatch) {
        const nameParts = nameMatch[1].split('<<');
        const surname = nameParts[0].replace(/</g, ' ').trim();
        const givenNames = nameParts[1] ? nameParts[1].replace(/</g, ' ').trim() : '';
        
        return {
          country: countryMatch ? countryMatch[1] : '',
          surname: surname,
          givenNames: givenNames,
          fullName: `${givenNames} ${surname}`.trim()
        };
      }
    }
    
    return null;
  };

  // Enhanced text extraction with multiple patterns
  const extractPersonalInfo = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Comprehensive patterns for different passport formats
    const patterns = {
      fatherName: [
        /(?:Father(?:'s)?\s*Name|Father|F\/O)[:\s]+([A-Z][A-Z\s]+?)(?:\n|$|Mother|Address|Authority)/i,
        /(?:FATHER|F\/O)[:\s]+([A-Z][A-Z\s]+?)(?:\n|$|MOTHER|ADDRESS)/i,
        /Father[:\s]*([A-Z][A-Z\s]+?)(?:\s*Mother|\s*$)/i
      ],
      motherName: [
        /(?:Mother(?:'s)?\s*Name|Mother|M\/O)[:\s]+([A-Z][A-Z\s]+?)(?:\n|$|Address|Authority)/i,
        /(?:MOTHER|M\/O)[:\s]+([A-Z][A-Z\s]+?)(?:\n|$|ADDRESS|AUTHORITY)/i,
        /Mother[:\s]*([A-Z][A-Z\s]+?)(?:\s*Address|\s*$)/i
      ],
      address: [
        /(?:Address|Add|Addr)[:\s]+([A-Z0-9\s,.-]+?)(?:\n|$|Authority|Issue)/i,
        /(?:ADDRESS|ADD)[:\s]+([A-Z0-9\s,.-]+?)(?:\n|$|AUTHORITY|ISSUE)/i,
        /(?:Place\s*of\s*Birth|POB)[:\s]+([A-Z\s,.-]+?)(?:\n|$)/i,
        /(?:PLACE\s*OF\s*BIRTH|POB)[:\s]+([A-Z\s,.-]+?)(?:\n|$)/i
      ]
    };

    const extractField = (fieldPatterns) => {
      for (const pattern of fieldPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim().replace(/\s+/g, ' ');
        }
      }
      
      // Try line-by-line extraction for better accuracy
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of fieldPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            // Look for continuation in next line if current match seems incomplete
            let result = match[1].trim();
            if (i + 1 < lines.length && result.length < 10) {
              const nextLine = lines[i + 1];
              if (nextLine.match(/^[A-Z\s]+$/)) {
                result += ' ' + nextLine;
              }
            }
            return result.replace(/\s+/g, ' ').trim();
          }
        }
      }
      
      return '';
    };

    return {
      fatherName: extractField(patterns.fatherName),
      motherName: extractField(patterns.motherName),
      address: extractField(patterns.address)
    };
  };

  // Dynamic Tesseract OCR processing with MRZ parsing - NO STATIC DATA
  const processDocument = async (file) => {
    setIsProcessing(true);
    setStatus('Initializing OCR engine...');
    setOcrConfidence(0);
    
    try {
      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      // Check if Tesseract is available - REQUIRED for functionality
      if (typeof window !== 'undefined' && window.Tesseract) {
        setStatus('Loading OCR engine...');
        
        // Initialize Tesseract worker with optimized settings
        const worker = await window.Tesseract.createWorker({
          logger: m => {
            if (m.status === 'recognizing text') {
              setStatus(`Processing document: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        
        // Configure OCR for passport documents
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>:/.,- ',
          tessedit_pageseg_mode: '6', // Uniform block of text
          preserve_interword_spaces: '1'
        });
        
        setStatus('Extracting text from document...');
        
        // Perform OCR on the uploaded image
        const { data: { text, confidence } } = await worker.recognize(file);
        
        await worker.terminate();
        
        // Only use real OCR results - no static data
        setExtractedText(text);
        setOcrConfidence(confidence);
        setStatus('Parsing extracted data...');
        
        // Parse MRZ from actual OCR text
        const mrzData = parseMRZ(text);
        
        // Extract personal information from real OCR text
        const personalInfo = extractPersonalInfo(text);
        
        // Use only dynamically extracted data
        const extractedData = {
          fatherName: personalInfo.fatherName || '',
          motherName: personalInfo.motherName || '',
          address: personalInfo.address || ''
        };
        
        // Log MRZ data if found for debugging
        if (mrzData && mrzData.fullName) {
          console.log('MRZ Data extracted:', mrzData);
        }
        
        // Update form fields with real extracted data only
        setFormData(extractedData);
        
        const filledFields = Object.values(extractedData).filter(val => val.length > 0).length;
        
        if (filledFields === 0) {
          setStatus(`Document processed but no recognizable fields found. Please ensure the image is clear and contains passport information.`);
        } else {
          setStatus(`Document processed successfully! Extracted ${filledFields}/3 fields with ${Math.round(confidence)}% confidence.`);
        }
        
      } else {
        // No fallback simulation - Tesseract.js is required
        setStatus('Error: Tesseract.js is not loaded. Please add the Tesseract.js script to your HTML head.');
        throw new Error('Tesseract.js is required for OCR functionality');
      }
      
    } catch (error) {
      setStatus('Error processing document. Please ensure Tesseract.js is loaded and try again.');
      console.error('OCR Error:', error);
      
      // Clear any previous data on error
      setFormData({
        fatherName: '',
        motherName: '',
        address: ''
      });
      setExtractedText('');
      setOcrConfidence(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processDocument(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processDocument(files[0]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Upload Traveler's Back Passport Page
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div>
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {uploadedImage ? (
              <div className="space-y-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded passport" 
                  className="max-w-full h-48 object-contain mx-auto rounded-lg"
                />
                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-500">Drag and drop files to upload</p>
                  <p className="text-gray-400">or</p>
                  <button
                    onClick={handleSelectFile}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select file
                  </button>
                </div>
                
                <div className="text-xs text-gray-400">
                  <p>Supports JPEG, JPG, PDF, PNG</p>
                  <p>Max file size 5MB</p>
                </div>
              </div>
            )}
          </div>
          
          {status && (
            <div className={`mt-4 p-3 rounded-lg flex items-center justify-between ${
              status.includes('Error') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              <div className="flex items-center space-x-2">
                {status.includes('Error') ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{status}</span>
              </div>
              
              {ocrConfidence > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium">Confidence:</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        ocrConfidence >= 90 ? 'bg-green-500' :
                        ocrConfidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(ocrConfidence, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{Math.round(ocrConfidence)}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Father's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Father's Name
            </label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter father's name"
            />
          </div>

          {/* Mother's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mother's Name
            </label>
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => handleInputChange('motherName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter mother's name"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              placeholder="Enter address"
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Submit Form'
            )}
          </button>
        </div>
      </div>

      {/* Extracted Text Preview (for debugging) */}
      {extractedText && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Extracted Text (for debugging):
          </h3>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PassportScannerForm;