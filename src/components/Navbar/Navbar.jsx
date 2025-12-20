import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import Button from '../Button/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ searchQuery, onSearchChange, docTitle, onTitleChange, isSaving }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isEditing = location.pathname.startsWith('/editor');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isDropdownOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {isEditing ? (
                    <div className="navbar-title-edit">
                        <Link to="/dashboard" className="back-button" title="Back to Dashboard">
                            🔙
                        </Link>
                        <input
                            type="text"
                            className="nav-title-input"
                            value={docTitle}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder="Document title"
                        />
                        {isSaving && <span className="nav-save-status">Saving...</span>}
                    </div>
                ) : (
                    <Link to="/dashboard" className="logo">
                        <span className="logo-icon">📄</span>
                        <span className="logo-text">DocEditor</span>
                    </Link>
                )}
            </div>

            <div className="navbar-center">
                {isEditing ? (
                    <Link to="/dashboard" className="logo centered-logo">
                        <span className="logo-icon">📄</span>
                        <span className="logo-text">DocEditor</span>
                    </Link>
                ) : (
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search documents, folders..."
                            value={searchQuery || ''}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="navbar-right">
                {user ? (
                    <div className="user-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={dropdownRef}>
                        <span className="username">{user.name}</span>
                        <div className="avatar">{getInitials(user.name)}</div>
                        <div className={`profile-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                            <div className="user-info-header">
                                <strong>{user.name}</strong>
                                <span>{user.email}</span>
                            </div>
                            <hr />
                            <button onClick={handleLogout} className="dropdown-item logout-btn">Logout</button>
                        </div>
                    </div>
                ) : (
                    <Link to="/login">
                        <Button variant="primary">Login</Button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
