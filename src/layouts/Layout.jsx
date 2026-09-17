import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieConsent from "../components/CookieConsent";
import BottomAnchorAd from "../components/BottomAnchorAd";
import DesktopSideAds from "../components/DesktopSideAds";
import AdScriptLoader from "../components/AdScriptLoader";
import AdUnit from "../components/AdUnit";
import BlogInterstitialGate from "../components/BlogInterstitialGate";
import { BlogNavigationProvider } from "../hooks/useBlogNavigation";
import "./Layout.css";

const Layout = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <BlogNavigationProvider>
      <AdScriptLoader />
      <BlogInterstitialGate />
      <Header />
      {location.pathname === "/" && (
        <section className="header-ad-section" aria-label="Top advertisement">
          <div className="container">
            <AdUnit key="home-header-square" slot="MIDDLE_1" size="square" />
          </div>
        </section>
      )}
      <main className="main-content">
        <Outlet key={location.pathname} />
      </main>
      <Footer />
      <CookieConsent />
      <BottomAnchorAd />
      <DesktopSideAds />
    </BlogNavigationProvider>
  );
};
export default Layout;
