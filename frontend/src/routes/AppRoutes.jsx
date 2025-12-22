import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Editor from '../pages/Editor';
import ImageEditorPage from '../pages/ImageEditorPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/image-editor" element={<ImageEditorPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
