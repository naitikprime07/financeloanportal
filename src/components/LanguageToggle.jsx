import { getCurrentSiteLanguage } from "../config/siteConfig";
import "./LanguageToggle.css";

const LanguageToggle = () => {
  const siteLanguage = getCurrentSiteLanguage();

  return (
    <div className="language-toggle">
      {siteLanguage === "hi" && (
        <button className="language-button active" aria-label="Hindi">
          हिंदी
        </button>
      )}
      {siteLanguage === "en" && (
        <button className="language-button active" aria-label="English">
          English
        </button>
      )}
    </div>
  );
};

export default LanguageToggle;
