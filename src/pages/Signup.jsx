import React, { useState } from 'react';
import './Login.css'; // Reuse login styles for consistency
import Button from '../components/Button/Button';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('initial'); // 'initial' or 'verifying'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignupRequest = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Signup request successful, switching to verification step');
                setStep('verifying');
            } else {
                setError(data.message || 'Error occurred');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, otp }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <span className="logo-icon">📄</span>
                    <h1>{step === 'initial' ? 'Create Account' : 'Verify Email'}</h1>
                    <p>
                        {step === 'initial'
                            ? 'Sign up to start creating amazing lessons'
                            : `Enter the 6-digit code sent to kampadevaselvaraj@gmail.com`}
                    </p>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

                {step === 'initial' ? (
                    <form className="login-form" onSubmit={handleSignupRequest}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" placeholder="name@company.com" value={formData.email} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} required />
                        </div>

                        <Button type="submit" variant="primary" className="login-btn" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Sign Up'}
                        </Button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="123456"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" className="login-btn" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Sign Up'}
                        </Button>
                        <Button variant="text" className="login-btn" onClick={() => setStep('initial')}>
                            Back to Sign Up
                        </Button>
                    </form>
                )}

                <div className="login-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
