import React from 'react';
import './SignUpPage.css';

const SuccessPopup = ({ message, onConfirm }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-icon">✓</div>
                <h2>회원가입 성공!</h2>
                <p>{message}</p>
                <button
                    className="popup-confirm-button"
                    onClick={onConfirm}
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default SuccessPopup;