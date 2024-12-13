// components/Navbar/AdminNavbar.jsx
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import ProfileDropdown from './ProfileDropdown';

const AdminNavbar = ({ userData, handleLogout, navigate }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="로고" className="logo-image" />
                </Link>
                <ul className="navbar-menu">
                    <button onClick={() => navigate('/admin/dashboard')} className="navbar-button">
                        대시보드
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

export default AdminNavbar;