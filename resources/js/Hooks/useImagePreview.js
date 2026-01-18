import { useState, useEffect } from 'react';

export default function useImagePreview(initialImage = null) {
    const [preview, setPreview] = useState(initialImage);

    const handleImageChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearPreview = () => {
        setPreview(initialImage);
    };

    return {
        preview,
        handleImageChange,
        clearPreview,
        setPreview,
    };
}
