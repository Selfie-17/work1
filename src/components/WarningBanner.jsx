import { ExternalLink } from 'lucide-react';
import './WarningBanner.css';

export default function WarningBanner({ message, linkText, linkUrl }) {
    return (
        <div className="warning-banner">
            <p>
                {message || "Double check for accuracy and avoid sharing personal info."}
                {linkText && (
                    <>
                        {' '}
                        <a href={linkUrl || '#'} target="_blank" rel="noopener noreferrer">
                            {linkText}
                            <ExternalLink />
                        </a>
                    </>
                )}
            </p>
        </div>
    );
}
