import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a server
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | FinanceLoan</title>
        <meta name="description" content="Get in touch with the FinanceLoan team. We're here to help with your questions and feedback." />
        <link rel="canonical" href="https://finvexa.com/contact" />
      </Helmet>

      <div className="contact-page">
        <div className="container">
          <div className="contact-content">
            <h1>Contact Us</h1>

            <section className="contact-intro">
              <h2>Get in Touch</h2>
              <p>
                Have questions, feedback, or suggestions? We'd love to hear from you. Fill out the form below,
                and our team will get back to you as soon as possible.
              </p>
            </section>

            <section className="contact-form-section">
              <h2>Send us a Message</h2>

              {submitted && (
                <div className="success-message">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
