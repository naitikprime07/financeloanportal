import AdUnit from './AdUnit';

const AdBanner = ({ slot, className = '', label = true }) => (
  <AdUnit slot={slot} className={className} label={label} />
);

export default AdBanner;