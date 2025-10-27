import React, { useState } from 'react';

const CvJobAdComparison: React.FC = () => {
  const [jobAdText, setJobAdText] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Function to parse and format the AI response
  const parseAiResponse = (responseText: string) => {
    try {
      // Parse the outer JSON
      const parsed = JSON.parse(responseText);
      const aiResponse = parsed.aiResponse;
      
      // Extract JSON from the markdown code block
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        return jsonData;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return null;
    }
  };

  // Function to render formatted comparison result
  const renderFormattedResult = (resultText: string) => {
    const parsedData = parseAiResponse(resultText);
    
    if (!parsedData) {
      return <pre style={{ whiteSpace: 'pre-wrap', color: '#1f2937' }}>{resultText}</pre>;
    }

    return (
      <div style={{ color: '#1f2937' }}>
        {/* Fit Summary */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px',
            padding: '8px 0',
            borderBottom: '2px solid #2563eb'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>📋</span>
            <h5 style={{ 
              color: '#2563eb', 
              margin: '0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Overall Fit Assessment
            </h5>
          </div>
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '16px', 
            borderRadius: '8px',
            borderLeft: '4px solid #2563eb',
            color: '#1f2937',
            lineHeight: '1.6'
          }}>
            {parsedData.FitSummary}
          </div>
        </div>

        {/* Matching Skills */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px',
            padding: '8px 0',
            borderBottom: '2px solid #10b981'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>✅</span>
            <h5 style={{ 
              color: '#10b981', 
              margin: '0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Matching Skills & Technologies
            </h5>
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '8px'
          }}>
            {parsedData.MatchingSkills?.map((skill: string, index: number) => (
              <div key={index} style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                border: '1px solid #bbf7d0',
                color: '#166534'
              }}>
                <span style={{ 
                  color: '#10b981', 
                  marginRight: '8px',
                  fontWeight: 'bold'
                }}>
                  ●
                </span>
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Missing Requirements */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px',
            padding: '8px 0',
            borderBottom: '2px solid #f59e0b'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>⚠️</span>
            <h5 style={{ 
              color: '#f59e0b', 
              margin: '0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Areas for Development
            </h5>
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '8px'
          }}>
            {parsedData.MissingRequirements?.map((req: string, index: number) => (
              <div key={index} style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #fcd34d',
                color: '#92400e'
              }}>
                <span style={{ 
                  color: '#f59e0b', 
                  marginRight: '8px',
                  fontWeight: 'bold'
                }}>
                  ●
                </span>
                {req}
              </div>
            ))}
          </div>
        </div>

        {/* Relevant Experience */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px',
            padding: '8px 0',
            borderBottom: '2px solid #2563eb'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>💼</span>
            <h5 style={{ 
              color: '#2563eb', 
              margin: '0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Professional Experience
            </h5>
          </div>
          <div style={{ color: '#1f2937' }}>
            {parsedData.RelevantExperiences?.map((exp: string, index: number) => (
              <div key={index} style={{ 
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                borderLeft: '3px solid #2563eb',
                color: '#1f2937',
                lineHeight: '1.5'
              }}>
                {exp}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px',
            padding: '8px 0',
            borderBottom: '2px solid #10b981'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🎓</span>
            <h5 style={{ 
              color: '#10b981', 
              margin: '0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Education & Certifications
            </h5>
          </div>
          <div style={{ color: '#1f2937' }}>
            {parsedData.EducationAndCertifications?.map((edu: string, index: number) => (
              <div key={index} style={{ 
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                borderLeft: '3px solid #10b981',
                color: '#1f2937',
                lineHeight: '1.5'
              }}>
                {edu}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
      const response = await fetch('http://localhost:5071/api/home/CompareCvToJobAd', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const resultText = await response.text();
        setResult(resultText);
      } else {
        alert('Failed to compare CV to job ad');
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
              📄 Job Advertisement Text:
            </label>
            <textarea
              value={jobAdText}
              onChange={(e) => setJobAdText(e.target.value)}
              placeholder="Paste the complete job advertisement here..."
              required
              rows={8}
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
              📎 Candidate CV File:
            </label>
            <input
              type="file"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              required
              accept=".pdf,.doc,.docx"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                color: '#1f2937',
                backgroundColor: '#f8fafc',
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
            {loading ? '🔄 Analyzing CV...' : '🚀 Analyze CV Match'}
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