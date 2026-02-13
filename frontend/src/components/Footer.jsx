import React from "react";

export default function Footer() {
  return (
    <footer className="footer-cyber">
      <div className="footer-content">
        <div className="footer-col">
          <span className="logo footer-logo">cyber</span>
          <p className="footer-desc">
            We are a residential interior design firm located in Portland. Our
            boutique-studio offers more than
          </p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <a href="#services-bonus" className="footer-link">Bonus program</a>
          <a href="#services-giftcards" className="footer-link">Gift cards</a>
          <a href="#services-credit" className="footer-link">Credit and payment</a>
          <a href="#services-contracts" className="footer-link">Service contracts</a>
        </div>
        <div className="footer-col">
          <h4>Assistance to the buyer</h4>
          <a href="#assist-order" className="footer-link">Find an order</a>
          <a href="#assist-delivery" className="footer-link">Terms of delivery</a>
          <a href="#assist-exchange" className="footer-link">Exchange and return of goods</a>
          <a href="#assist-guarantee" className="footer-link">Guarantee</a>
        </div>
        <div className="footer-col">
          <h4>Socials</h4>
          <a href="#social-twitter" className="footer-link">Twitter</a>
          <a href="#social-instagram" className="footer-link">Instagram</a>
          <a href="#social-facebook" className="footer-link">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
