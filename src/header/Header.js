import React from 'react';
import './Header.css'; 
import { FaBookOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = ({ buttonLeftName, buttonLeftRoute, buttonRightName, buttonRightRoute, title}) => {
  return (
    <div className='header'>
        <div className='navegation'>
            <div className='left'>
                <FaBookOpen className='icon'/>
                <p>UniPoa</p>
            </div>
            <div className='right'>
                <Link to={buttonLeftRoute} className='button'>{buttonLeftName}</Link>
                <Link to={buttonRightRoute} className='button'>{buttonRightName}</Link>
            </div>
        </div>
        <div className='title'>
            <h3>{title}</h3>
        </div>
    </div>
  );
};

export default Header;
