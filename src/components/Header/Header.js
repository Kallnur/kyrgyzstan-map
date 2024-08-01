// src/components/Header/Header.js
import React from 'react';
import { ReactComponent as Gerb } from "../../assets/images/gerb.svg";
import './Header.css';

function Header() {
  return (
    <div className="Header">
     <div className='headerLogo'>
      <Gerb className="gerb-icon" />
      <span>Кыргыз Республикасынын,<br/>Эмгек, социалдык камсыздоо жана миграция министрлиги</span>
      </div>
      <div className='selectSocialBtns'>
        <a href='#'>Уй-булоого комок</a>
        <a href='#'>Социальный контракт</a>
        <a href='#'>Социальный паспорт</a>
      </div>
    </div>
  );
}

export default Header;
