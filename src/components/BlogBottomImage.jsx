import personalLoanImg from "../assets/blogBottomImages/personalLoan.svg";
import aadharPeLoanImg from "../assets/blogBottomImages/aadharPeLoan.svg";
import carLoanImg from "../assets/blogBottomImages/carLoan.svg";
import goldLoanImg from "../assets/blogBottomImages/goldLoan.svg";
import studentLoanImg from "../assets/blogBottomImages/studentLoan.svg";
import homeLoanImg from "../assets/blogBottomImages/homeLoan.svg";
import ePersonalLoanImg from "../assets/blogBottomImages/e_personalLoan.png";
import eAadharPeLoanImg from "../assets/blogBottomImages/e_aadharPeLoan.png";
import eCarLoanImg from "../assets/blogBottomImages/e_carLoan.png";
import eGoldLoanImg from "../assets/blogBottomImages/e_goldLoan.png";
import eStudentLoanImg from "../assets/blogBottomImages/e_studentLoan.png";
import eHomeLoanImg from "../assets/blogBottomImages/e_homeLoan.png";
import personalLoanV2Img from "../assets/blogBottomImages/personalLoan-v2.png";
import aadharPeLoanV2Img from "../assets/blogBottomImages/aadharPe-v2.png";
import ePersonalLoanV2Img from "../assets/blogBottomImages/e_personalLoan-v2.png";
import eAadharPeLoanV2Img from "../assets/blogBottomImages/e_aadharPeLoan-v2.png";
import studentLoanV2Img from "../assets/blogBottomImages/studentLoan-v2.png";
import "./BlogBottomImage.css";

const blogImageMap = {
  "personal-loan-online-eligibility-check-apply": personalLoanImg,
  "personal-loan-online-apply-guide": personalLoanV2Img,
  "personal-loan-online-check-eligibility-apply": ePersonalLoanImg,
  "personal-loan-online-application-guide": ePersonalLoanV2Img,
  "aadhaarpe-loan-online-eligibility-check-apply": aadharPeLoanImg,
  "aadhaarpe-loan-online-application-guide": aadharPeLoanV2Img,
  "aadhaarpe-loan-online-check-eligibility-apply": eAadharPeLoanImg,
  "aadhaarpe-loan-online-application-process-guide": eAadharPeLoanV2Img,
  "car-loan-check-offers-apply-online": carLoanImg,
  "car-loan-explore-financing-next-car": eCarLoanImg,
  "gold-loan-check-offers-apply-online": goldLoanImg,
  "gold-loan-explore-options-against-gold": eGoldLoanImg,
  "student-loan-education-finance-options": studentLoanImg,
  "student-loan-online-education-finance-guide": studentLoanV2Img,
  "student-loan-explore-education-financing": eStudentLoanImg,
  "home-loan-housing-finance-options": homeLoanImg,
  "home-loan-explore-financing-dream-home": eHomeLoanImg,
};

const BlogBottomImage = ({ postId, imageRef }) => {
  const imageSrc = blogImageMap[postId];

  if (!imageSrc) {
    return null;
  }

  return (
    <div className="blog-bottom-image">
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Loan information"
        loading="lazy"
      />
    </div>
  );
};

export default BlogBottomImage;
