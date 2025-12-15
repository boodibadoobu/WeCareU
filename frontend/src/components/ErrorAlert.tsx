import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ErrorAlertProps {
    message: string | null;
    onClose?: () => void;
    autoHideDuration?: number; // in milliseconds, 0 = no auto-hide
}

const ErrorAlert = ({ message, onClose, autoHideDuration = 5000 }: ErrorAlertProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            
            if (autoHideDuration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoHideDuration);
                
                return () => clearTimeout(timer);
            }
        } else {
            setVisible(false);
        }
    }, [message, autoHideDuration]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
    };

    if (!visible || !message) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
            <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
                    <p className="text-sm text-red-700">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="ml-3 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default ErrorAlert;
