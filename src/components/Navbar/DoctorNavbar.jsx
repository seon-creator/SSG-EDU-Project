// components/Navbar/DoctorNavbar.jsx
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import ProfileDropdown from './ProfileDropdown';

const DoctorNavbar = ({ userData, handleLogout, navigate }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="로고" className="logo-image" />
                </Link>
                <ul className="navbar-menu">
                    <button onClick={() => navigate('/enterInfo')} className="navbar-button">
                        신고 등록
                    </button>
                    <button onClick={() => navigate('/report-list')} className="navbar-button">
                        신고 목록
                    </button>
                    <ProfileDropdown
                        userData={userData}
                        handleLogout={handleLogout}
                    />
                </ul>
            </div>
        </nav>
    );
};

export default DoctorNavbar;