import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1>Privacy Policy</h1>
      <p>Use this page to detail your site's privacy policy.</p>
      
      <div style={{ textAlign: 'left', marginTop: '30px' }}>
        <h2>Information We Collect</h2>
        <p>This section describes what information we collect from users of the JBDH platform.</p>
        
        <h2>How We Use Your Information</h2>
        <p>This section explains how we use the collected information.</p>
        
        <h2>Data Protection</h2>
        <p>This section describes how we protect your personal data.</p>
        
        <h2>Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;