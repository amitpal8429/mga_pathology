// src/components/AutoLeadPopup.jsx
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import EnquiryForm from './EnquiryForm';
import Icon from './Icon';
import './AutoLeadPopup.css';

const DELAY_MS = 3000; // 3 second delay

export default function AutoLeadPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const { pathname } = useLocation();

  // Close handler
  const close = useCallback(() => {
    setShowPopup(false);
  }, []);

  // Har route change pe popup band, phir 3s baad open
  useEffect(() => {
    setShowPopup(false);

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Esc key se close
  useEffect(() => {
    if (!showPopup) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPopup, close]);

  // Body scroll lock
  useEffect(() => {
    if (!showPopup) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showPopup]);

  // Manual trigger: window.dispatchEvent(new Event('enq:open'))
  useEffect(() => {
    const openHandler = () => setShowPopup(true);
    window.addEventListener('enq:open', openHandler);
    return () => window.removeEventListener('enq:open', openHandler);
  }, []);

  if (!showPopup) return null;

  return (
    <div className="alp" role="dialog" aria-modal="true" aria-label="Enquiry form">
      <div className="alp__backdrop" onClick={close} />

      <div className="alp__panel">
        <button
          type="button"
          className="alp__close"
          onClick={close}
          aria-label="Close form"
        >
          <Icon name="close" size={20} />
        </button>

        <div className="alp__body">
          <EnquiryForm onSubmit={close} />
        </div>
      </div>
    </div>
  );
}