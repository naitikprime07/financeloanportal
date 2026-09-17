import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieConsent from "../components/CookieConsent";
import MobileAnchorAd from "../components/MobileAnchorAd";
import DesktopSideAds from "../components/DesktopSideAds";
import AdScriptLoader from "../components/AdScriptLoader";
import TopFloatingExpandableAd from "../components/TopFloatingExpandableAd";
import AdUnit from "../components/AdUnit";

const Layout = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <AdScriptLoader />
      <TopFloatingExpandableAd />
      <Header />
      <main className="main-content">
        <Outlet key={location.pathname} />
      </main>
      <section className="bottom-ad-rail" aria-label="Bottom advertisement">
        <div className="container">
          <AdUnit key={`bottom-${location.pathname}`} slot="BOTTOM" />
        </div>
      </section>
      <Footer />
      <CookieConsent />
      <MobileAnchorAd />
      <DesktopSideAds />
    </>
  );
};
export default Layout;

