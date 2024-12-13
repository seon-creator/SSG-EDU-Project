import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import ProfileDropdown from './ProfileDropdown';

const UserNavbar = ({ userData, handleLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="로고" className="logo-image" />
                </Link>
                <ul className="navbar-menu">
                    <Link to="/chat" className="navbar-link">
                        <i className="fas fa-comments"></i> 채팅
                    </Link>
                    <Link to="/report-chatbot" className="navbar-link">
                        <i className="fas fa-robot"></i> 챗봇 보고서
                    </Link>
                    <Link to="/history-report-chatbot" className="navbar-link">
                        <i className="fas fa-history"></i> 보고서 내역
                    </Link>
                    <ProfileDropdown
                        userData={userData}
                        handleLogout={handleLogout}
                    />
                </ul>
            </div>
        </nav>
    );
};

export default UserNavbar;