import { Helmet } from 'react-helmet-async';
import './StaticPage.css';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | FinanceLoan</title>
        <meta name="description" content="Read the Terms & Conditions for using FinanceLoan." />
        <link rel="canonical" href="https://finvexa.com/terms" />
      </Helmet>

      <div className="static-page">
        <div className="container">
          <div className="static-content">
            <h1>Terms & Conditions</h1>

            <section className="content-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using FinanceLoan, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="content-section">
              <h2>2. Use of the Website</h2>
              <p>
                You may use this website for lawful purposes only. You agree not to use the website in any way that breaches
                any applicable local, national, or international law or regulation.
              </p>
            </section>

            <section className="content-section">
              <h2>3. Intellectual Property Rights</h2>
              <p>
                Unless otherwise stated, FinanceLoan and/or its licensors own the intellectual property rights for all material
                on FinanceLoan. All intellectual property rights are reserved. You may access this from FinanceLoan for your own
                personal use subjected to restrictions set in these terms and conditions.
              </p>
            </section>

            <section className="content-section">
              <h2>4. User Content</h2>
              <p>
                Parts of this website may offer an opportunity for users to post and exchange opinions and information.
                FinanceLoan does not filter, edit, publish, or review Comments prior to their presence on the website.
                Comments do not reflect the views and opinions of FinanceLoan, its agents, and/or affiliates.
              </p>
            </section>

            <section className="content-section">
              <h2>5. Disclaimers and Limitation of Liability</h2>
              <p>
                The information provided on this website is for general informational purposes only. We make no representations
                or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or
                availability of the information, products, services, or related graphics contained on the website.
              </p>
            </section>

            <section className="content-section">
              <h2>6. External Links</h2>
              <p>
                Our website may contain links to third-party websites or services that are not owned or controlled by FinanceLoan.
                We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any
                third-party websites or services.
              </p>
            </section>

            <section className="content-section">
              <h2>7. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably
                submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="content-section">
              <h2>8. Image Usage & Copyright Disclaimer</h2>
              <p>
                Images used on this website may be sourced from various providers. We respect intellectual property rights
                and make efforts to credit original sources. If you believe any content infringes your copyright, please contact us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
