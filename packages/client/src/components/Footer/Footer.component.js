import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.styles.css';

export const Footer = () => {
  return (
    <div className="footer">
      <div className="menu">
        <ul>
          <li>
            <NavLink to="/faq" className="nav-link">
              FAQ
            </NavLink>
          </li>
        </ul>
      </div>
      <span>&copy;2023</span>
    </div>
  );
};
