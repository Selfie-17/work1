import { useState } from 'react';
import { ChevronDown, Search, User, Settings, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <nav className="navbar">
            {/* Left Section */}
            <div className="navbar-left">
                <button className="explore-btn">
                    Explore
                    <ChevronDown />
                </button>

                <div className="search-container">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search"
                    />
                </div>
            </div>

            {/* Center - Brand */}
            <div className="navbar-center">
                <a href="/" className="brand-logo">
                    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="18" r="18" fill="#14bf96" />
                        <path d="M8 12h20M8 18h20M8 24h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    Editor
                </a>
            </div>

            {/* Right Section */}
            <div className="navbar-right">
                <button className="guest-btn">
                    <User size={18} />
                    Guest
                </button>

                <div className="user-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <div className="avatar-circle">G</div>
                    <ChevronDown className="avatar-dropdown" />

                    {showProfileMenu && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                <div className="avatar-circle-lg">G</div>
                                <div className="profile-info">
                                    <span className="profile-name">Guest User</span>
                                    <span className="profile-email">guest@example.com</span>
                                </div>
                            </div>
                            <div className="profile-menu-divider"></div>
                            <button className="profile-menu-item">
                                <User size={16} />
                                Profile
                            </button>
                            <button className="profile-menu-item">
                                <Settings size={16} />
                                Settings
                            </button>
                            <div className="profile-menu-divider"></div>
                            <button className="profile-menu-item logout">
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
