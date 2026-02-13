import React from "react";

export default function Footer() {
  return (
    <footer className="footer-cyber">
      <div className="footer-content">
        <div className="footer-col">
          <span className="logo footer-logo" style={{ color: 'white' }}>cyber</span>
          <p className="footer-desc">We are a residential interior design firm located in Portland. Our boutique-studio offers more than</p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <button type="button" className="footer-link">Bonus program</button>
          <button type="button" className="footer-link">Gift cards</button>
          <button type="button" className="footer-link">Credit and payment</button>
          <button type="button" className="footer-link">Service contracts</button>
        </div>
        <div className="footer-col">
          <h4>Assistance to the buyer</h4>
          <button type="button" className="footer-link">Find an order</button>
          <button type="button" className="footer-link">Terms of delivery</button>
          <button type="button" className="footer-link">Exchange and return of goods</button>
          <button type="button" className="footer-link">Guarantee</button>
        </div>
        <div className="footer-col">
          <h4>Socials</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="footer-link">Twitter</button>
            <button type="button" className="footer-link">Instagram</button>
            <button type="button" className="footer-link">Facebook</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
