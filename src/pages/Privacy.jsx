import { Helmet } from 'react-helmet-async';
import './StaticPage.css';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | FinanceLoan</title>
        <meta name="description" content="Read the Privacy Policy for FinanceLoan to understand how we collect, use, and protect your information." />
        <link rel="canonical" href="https://finvexa.com/privacy" />
      </Helmet>

      <div className="static-page">
        <div className="container">
          <div className="static-content">
            <h1>Privacy Policy</h1>

            <section className="content-section">
              <h2>Data Controller & Applicable Laws</h2>
              <p>
                FinanceLoan ("we," "us," or "our") operates the website and is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section className="content-section">
              <h2>1. Information We Collect</h2>
              <p>
                We may collect information about you in a variety of ways. The information we may collect on the website includes:
              </p>
              <ul>
                <li><strong>Personal Data:</strong> Name, email address, and other contact information you voluntarily provide</li>
                <li><strong>Usage Data:</strong> Information about how you access and use our website</li>
                <li><strong>Device Data:</strong> IP address, browser type, operating system, and device information</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect in various ways, including to:
              </p>
              <ul>
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Communicate with you regarding updates, newsletters, or marketing materials</li>
                <li>Process your transactions and manage your requests</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>3. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and store certain information.
                Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="content-section">
              <h2>4. Sharing Your Information</h2>
              <p>
                We may share your information in the following situations:
              </p>
              <ul>
                <li><strong>With Service Providers:</strong> To facilitate our services and perform service-related tasks</li>
                <li><strong>For Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
                <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>5. Data Security</h2>
              <p>
                We use administrative, technical, and physical security measures to protect your personal information.
                However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section className="content-section">
              <h2>6. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>The right to access and receive a copy of your personal data</li>
                <li>The right to rectify or update your personal information</li>
                <li>The right to erase your personal data</li>
                <li>The right to restrict processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to object to processing of your personal data</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>7. Children's Privacy</h2>
              <p>
                Our website is not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected information from a child under 13,
                please contact us immediately.
              </p>
            </section>

            <section className="content-section">
              <h2>8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="content-section">
              <h2>9. Media & Third-Party Content</h2>
              <p>
                Our website may include embedded content from third-party sources or display media from various providers.
                These third-party services may collect data about you, use cookies, embed additional third-party tracking,
                and monitor your interaction with that embedded content.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
