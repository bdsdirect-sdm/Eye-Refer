/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { PiHouseLight } from "react-icons/pi";
import { MdOutlinePersonalInjury } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { MdOutlineMarkChatRead } from "react-icons/md";
import { MdOutlinePersonPin } from "react-icons/md";
import { BiBookReader } from "react-icons/bi";
import { LuLogOut } from "react-icons/lu";
import logoImg from "../photos/logo1.png";
import './Header.css';


const Header: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const firstname = localStorage.getItem('firstname')
  const lastname = localStorage.getItem('lastname')


  console.log(firstname, "dkfjsdklfjsdklfj")

  const doctype: any = localStorage.getItem('doctype');

  const handleLogoClick = () => {
    console.log('Logo clicked, navigating to dashboard');
    navigate('/dashboard');
  };

  return (
    <>

      <header className="header-container">

        <div className="header-left">


        <div onClick={handleLogoClick} className="logo-class">
              <img src={logoImg} alt="EyeRefer" className="logo-img-class" />
              <span className='logo-text'>EYE REFER</span>
              <hr />
            </div>
        </div>


        <div className="header-right">
          <div className="user-actions">
            {token ? (
              <div className="dropdown">
                <h6 className="dropdown-toggle" aria-expanded="false">
      
               Hi, {firstname} {lastname}
                  <br className='welcome'></br>Welcome back
                </h6>
                


                <ul className="dropdown-menu">
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/update-password" className="dropdown-item">
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                      }}
                    >
                      Logout <LuLogOut />
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn login-btn">
                  Login
                </Link>
                <Link to="/" className="btn signup-btn">
                  Sign-up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>




      {token && (
        <div className="sidebar bg-white">
         

          <nav className="nav-links ">

            <div className='nav-link'>

              <Link to="/dashboard" className="nav-link">
              <PiHouseLight className='house' />

                Dashboard
              </Link>
            </div>

            <div className='nav-link'>
              <Link to="/patient" className="nav-link">
              <MdOutlinePersonalInjury className='house' />

                Patient
              </Link>
            </div>

            {doctype === '1' && (
              <div className='nav-link'>
                <Link to="/appointment-list" className="nav-link">
                <BiBookReader className='house'/>
                  Appointment
                </Link>
              </div>
            )}
            
            <div className='nav-link'>
            <Link to="/doctor" className="nav-link">
            <MdOutlinePersonPin className='house'/>
              Doctors
            </Link>
            </div>

            <div className='nav-link'>
              <Link to="/chat" className="nav-link">
              <MdOutlineMarkChatRead className='house' />
                Chat
              </Link>
            </div>

            <div className='nav-link'>
              <Link to="/add-staff" className="nav-link">
              <GrGroup className='house' />
                Staff
              </Link>
            </div>

          </nav>
        </div>
      )}

      <Outlet />
    </>
  );
};

export default Header;
