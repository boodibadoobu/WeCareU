import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const VideoCallPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        // In a real app, we would signal end of call via socket
        navigate(`/chat/${id}`);
    };

    return (
        <div className="h-[calc(100vh-100px)] bg-gray-900 rounded-xl overflow-hidden relative flex flex-col">
            {/* Main Video Area (Simulated) */}
            <div className="flex-1 flex items-center justify-center bg-gray-800 relative">
                <div className="text-white text-center">
                    <div className="h-32 w-32 bg-gray-700 rounded-full mx-auto flex items-center justify-center text-4xl font-bold mb-4">
                        U
                    </div>
                    <h2 className="text-2xl font-semibold">User (Remote)</h2>
                    <p className="text-green-400 mt-2">Connected • {formatTime(timer)}</p>
                </div>

                {/* Self View (Picture-in-Picture) */}
                <div className="absolute bottom-24 right-4 w-48 h-36 bg-black rounded-lg border-2 border-gray-700 overflow-hidden shadow-lg">
                    {isVideoOn ? (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xs">
                            Self View (Camera)
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white bg-gray-800">
                            <VideoOff className="h-8 w-8 text-gray-500" />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="h-20 bg-gray-900 flex items-center justify-center space-x-6">
                <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-4 rounded-full ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                >
                    {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                    <PhoneOff className="h-6 w-6" />
                </button>

                <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                >
                    {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;
