import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface Counselor {
    id: number;
    full_name: string;
    counselor_details: {
        specialization: string;
        years_experience: number;
    };
}

const StudentDashboard = () => {
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCounselors();
    }, []);

    // Auto-dismiss message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchCounselors = async () => {
        try {
            const res = await api.get('/counselors');
            setCounselors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCounselor) return;

        try {
            const scheduledStart = new Date(`${bookingDate}T${bookingTime}`);
            await api.post('/sessions', {
                counselor_id: selectedCounselor.id,
                scheduled_start: scheduledStart.toISOString()
            });

            // Success: Close modal and show success message
            setSelectedCounselor(null);
            setBookingDate('');
            setBookingTime('');
            setMessage('✅ Session booked successfully! Waiting for counselor approval.');
        } catch (err: any) {
            // Error: Close modal and show error message
            setSelectedCounselor(null);
            setBookingDate('');
            setBookingTime('');
            setMessage('❌ ' + (err.response?.data?.message || 'Booking failed. Please try again.'));
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Find a Counselor</h2>

            {message && (
                <div className={`p-4 rounded-lg ${message.startsWith('❌')
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {counselors.map((counselor) => (
                    <div key={counselor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                                {counselor.full_name.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <h3 className="font-semibold text-lg text-gray-900">{counselor.full_name}</h3>
                                <p className="text-sm text-gray-500">{counselor.counselor_details?.specialization}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                            <p>Experience: {counselor.counselor_details?.years_experience} years</p>
                        </div>

                        <button
                            onClick={() => setSelectedCounselor(counselor)}
                            className="w-full bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 font-medium transition-colors"
                        >
                            Book Session
                        </button>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {selectedCounselor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Book with {selectedCounselor.full_name}</h3>
                        <form onSubmit={handleBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    required
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCounselor(null)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
