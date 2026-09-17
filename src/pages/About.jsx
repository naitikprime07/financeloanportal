import { Helmet } from 'react-helmet-async';
import './StaticPage.css';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | FinanceLoan</title>
        <meta name="description" content="Learn about FinanceLoan - your trusted source for business insights, CRM solutions, and growth strategies." />
        <link rel="canonical" href="https://finvexa.com/about" />
      </Helmet>

      <div className="static-page">
        <div className="container">
          <div className="static-content">
            <h1>About FinanceLoan</h1>

            <section className="content-section">
              <h2>Who We Are</h2>
              <p>
                FinanceLoan is your comprehensive destination for business insights and technology solutions. We specialize in providing
                in-depth content about CRM solutions, sales automation, customer management, and business growth strategies.
              </p>
              <p>
                Our mission is to empower businesses and professionals with knowledge and insights that drive success.
                Whether you're looking for the latest CRM reviews, sales automation strategies, or business growth tips,
                we've got you covered.
              </p>
            </section>

            <section className="content-section">
              <h2>What We Cover</h2>
              <p>
                We provide comprehensive coverage across multiple areas:
              </p>
              <ul>
                <li><strong>CRM Solutions:</strong> In-depth reviews and comparisons of customer relationship management platforms</li>
                <li><strong>Sales Automation:</strong> Latest tools and strategies for automating sales processes</li>
                <li><strong>Customer Management:</strong> Best practices for managing and nurturing customer relationships</li>
                <li><strong>Business Growth:</strong> Proven strategies and insights for sustainable business expansion</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>How We Test</h2>
              <p>
                Our editorial team rigorously researches and evaluates every topic we cover. We combine industry expertise,
                hands-on testing, and comprehensive analysis to deliver accurate and valuable information to our readers.
              </p>
              <p>
                We maintain editorial independence and transparency in all our content. While we may feature sponsored
                content or affiliate links, our reviews and recommendations are always based on merit and value to our readers.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
