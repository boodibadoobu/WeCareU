import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Check, X, Calendar } from 'lucide-react';

interface SessionRequest {
    id: number;
    student: {
        full_name: string;
        nim: string;
    };
    scheduled_start: string;
    status: string;
}

const CounselorDashboard = () => {
    const [requests, setRequests] = useState<SessionRequest[]>([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/counselors/requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            await api.post(`/counselors/requests/${id}/${action}`);
            fetchRequests(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Session Requests</h2>

            {requests.length === 0 ? (
                <p className="text-gray-500">No pending requests.</p>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{req.student.full_name}</h3>
                                <p className="text-sm text-gray-500">NIM: {req.student.nim}</p>
                                <div className="flex items-center mt-2 text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(req.scheduled_start).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-4 sm:mt-0">
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'approve')}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CounselorDashboard;
