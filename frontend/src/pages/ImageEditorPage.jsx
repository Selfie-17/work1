import React from 'react';
import ImageEditor from '../components/ImageEditor';

const ImageEditorPage = () => {
    // Sample image URL - high quality landscape
    const sampleImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";

    return (
        <div className="h-screen w-full bg-black flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl h-[80vh] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <ImageEditor
                    src={sampleImage}
                    initialScale={0.8}
                />
            </div>
        </div>
    );
};

export default ImageEditorPage;
