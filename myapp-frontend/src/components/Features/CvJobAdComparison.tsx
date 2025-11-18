const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';

const CvJobAdComparison: React.FC = () => {
  const [jobAdText, setJobAdText] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Helper to parse AI response (handles different response formats)
  function parseAiResponse(resultText: string): any {
    try {
      // First try to parse as direct JSON
      return JSON.parse(resultText);
    } catch {
      try {
        // If that fails, look for JSON within markdown code blocks
        const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]);
        }
        
        // Also try to find JSON between triple backticks without json language specifier
        const codeMatch = resultText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          return JSON.parse(codeMatch[1]);
        }
        
        return null;
      } catch {
        return null;
      }
    }
  }

  // Function to render formatted comparison result
  const renderFormattedResult = (resultText: string) => {
    console.log('Rendering result:', resultText); // Debug log
    
    const parsedData = parseAiResponse(resultText);
    console.log('Parsed data:', parsedData); // Debug log
    
    if (!parsedData) {
      return (
        <div>
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
            <strong>Debug Info:</strong> Could not parse as JSON. Showing raw response:
          </div>
          <pre className="whitespace-pre-wrap text-slate-800 bg-gray-100 p-4 rounded border overflow-x-auto">
            {resultText}
          </pre>
        </div>
      );
    }
    return (
      <div className="text-slate-800">
        {/* Fit Summary */}
        {parsedData.FitSummary && (
          <div className="mb-6">
            <div className="flex items-center mb-3 pb-2 border-b-2 border-blue-600">
              <span className="text-lg mr-2">📋</span>
              <h5 className="text-blue-600 text-base font-semibold m-0">Overall Fit Assessment</h5>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-600 leading-relaxed">
              {parsedData.FitSummary}
            </div>
          </div>
        )}
        
        {/* Matching Skills */}
        {parsedData.MatchingSkills && parsedData.MatchingSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3 pb-2 border-b-2 border-emerald-500">
              <span className="text-lg mr-2">✅</span>
              <h5 className="text-emerald-500 text-base font-semibold m-0">Matching Skills & Technologies</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parsedData.MatchingSkills.map((skill: string, index: number) => (
                <div key={index} className="flex items-center p-2 bg-emerald-50 rounded-md border border-emerald-200 text-emerald-800">
                  <span className="text-emerald-500 mr-2 font-bold">●</span>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Missing Requirements */}
        {parsedData.MissingRequirements && parsedData.MissingRequirements.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3 pb-2 border-b-2 border-amber-400">
              <span className="text-lg mr-2">⚠️</span>
              <h5 className="text-amber-500 text-base font-semibold m-0">Areas for Development</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parsedData.MissingRequirements.map((req: string, index: number) => (
                <div key={index} className="flex items-center p-2 bg-amber-100 rounded-md border border-amber-300 text-amber-900">
                  <span className="text-amber-500 mr-2 font-bold">●</span>
                  {req}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Relevant Experience */}
        {parsedData.RelevantExperiences && parsedData.RelevantExperiences.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3 pb-2 border-b-2 border-blue-600">
              <span className="text-lg mr-2">💼</span>
              <h5 className="text-blue-600 text-base font-semibold m-0">Professional Experience</h5>
            </div>
            <div>
              {parsedData.RelevantExperiences.map((exp: string, index: number) => (
                <div key={index} className="p-3 mb-2 bg-slate-50 rounded-md border-l-4 border-blue-600 leading-relaxed">
                  {exp}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Education */}
        {parsedData.EducationAndCertifications && parsedData.EducationAndCertifications.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center mb-3 pb-2 border-b-2 border-emerald-500">
              <span className="text-lg mr-2">🎓</span>
              <h5 className="text-emerald-500 text-base font-semibold m-0">Education & Certifications</h5>
            </div>
            <div>
              {parsedData.EducationAndCertifications.map((edu: string, index: number) => (
                <div key={index} className="p-3 mb-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500 leading-relaxed">
                  {edu}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
// ...existing code...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobAdText.trim()) {
      alert('Please enter job ad text');
      return;
    }
    
    if (!cvFile) {
      alert('Please select a CV file');
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('jobAdText', jobAdText);
    formData.append('cvPath', cvFile);

    try {
      const response = await fetch(`${API_URL}/api/home/CompareCvToJobAd`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Backend response:', responseData); // Debug log
        
        // Backend returns { aiResponse: "JSON string" }
        const aiResponse = responseData.aiResponse || responseData;
        setResult(aiResponse);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Failed to compare CV to job ad: ' + response.status);
      }
    } catch (error) {
      console.error('Error comparing CV to job ad:', error);
      alert('Error comparing CV to job ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '32px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }}>
      <h3 style={{ 
        color: '#2563eb', 
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: '700',
        textAlign: 'center',
        borderBottom: '3px solid #2563eb',
        paddingBottom: '8px'
      }}>
        JBDH CV Analysis Tool
      </h3>
      
      {!result && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#1f2937',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Job Advertisement Text:
            </label>
            <textarea
              value={jobAdText}
              onChange={(e) => setJobAdText(e.target.value)}
              placeholder="Paste the complete job advertisement here..."
              required
              rows={8}
              className="input-dark"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: '1.5',
                transition: 'border-color 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#1f2937',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Candidate CV File:
            </label>
            <input
              type="file"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              required
              accept=".pdf,.doc,.docx"
              className="input-dark"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
              transform: loading ? 'none' : 'translateY(0)',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? 'Analyzing CV...' : 'Match CV to Job Ad'}
          </button>
        </form>
      )}

      {result && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          backgroundColor: '#f8fafc',
          border: '2px solid #2563eb',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)'
        }}>
          <h4 style={{ 
            color: '#2563eb', 
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: '700',
            textAlign: 'center',
            borderBottom: '2px solid #2563eb',
            paddingBottom: '8px'
          }}>
            📊 CV Analysis Results
          </h4>
          {renderFormattedResult(result)}
          <button 
            onClick={() => {
              setResult(null);
              setJobAdText('');
              setCvFile(null);
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🔄 Analyze Another CV
          </button>
        </div>
      )}
    </div>
  );
};

export default CvJobAdComparison;