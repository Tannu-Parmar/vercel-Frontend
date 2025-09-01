import React, { useState } from 'react';
import PassportForm from './PassportForm';
import PassportGuardianForm from './PassportGuardianForm';

const PassportApplication = () => {
  const [step, setStep] = useState(1);

  // Combined form data
  const [formData, setFormData] = useState({
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
    numberOfChildren: '',
    motherName: '',
    fatherName: '',
    address: '',
  });

  // Move to next or previous step
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Handle final submit
  const handleSubmit = () => {
    console.log('Submitted full form data:', formData);
    alert('Form submitted successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {step === 1 && (
        <PassportForm 
          formData={formData}
          setFormData={setFormData}
          nextStep={nextStep}
        />
      )}
      {step === 2 && (
        <PassportGuardianForm 
          formData={formData}
          setFormData={setFormData}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default PassportApplication;
