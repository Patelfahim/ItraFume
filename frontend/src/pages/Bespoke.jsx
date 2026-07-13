import { useEffect, useState } from "react";
import { FiClock, FiCheck, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/axios";
import BespokeForm from "../components/BespokeForm";

const Bespoke = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    api
      .get("/bespoke/my-requests")
      .then(({ data }) => setRequests(data.data.requests))
      .catch((err) => toast.error("Failed to load requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-5 h-5 text-yellow-500" />,
      "in-review": (
        <FiRefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      ),
      approved: <FiCheck className="w-5 h-5 text-green-500" />,
      "in-production": (
        <FiRefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      ),
      completed: <FiCheck className="w-5 h-5 text-green-500" />,
      rejected: <FiAlertCircle className="w-5 h-5 text-red-500" />,
    };
    return icons[status] || icons.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending Review",
      "in-review": "In Review",
      approved: "Approved",
      "in-production": "In Production",
      completed: "Completed",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-background py-12 md:py-16">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl mb-3">Bespoke Fragrances</h1>
          <p className="text-on-surface-variant text-lg">
            Create your perfect custom fragrance tailored to your unique
            preferences
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {showForm ? (
              <BespokeForm />
            ) : (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-dashed border-primary p-8 text-center">
                <h2 className="font-display text-2xl mb-3">
                  Ready to Create Your Bespoke Fragrance?
                </h2>
                <p className="text-on-surface-variant mb-6">
                  Fill out a simple form and our fragrance experts will craft a
                  custom scent just for you
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary px-8 py-3"
                >
                  Start Creating
                </button>
              </div>
            )}
          </div>

          {/* Requests List */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-6 sticky top-24">
              <h2 className="font-display text-xl mb-4">Your Requests</h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant text-sm mb-3">
                    No bespoke requests yet
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Create your first one
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="border border-surface-container-high rounded-lg p-3 hover:bg-surface-container-high/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {getStatusIcon(request.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {request.occasion}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {getStatusText(request.status)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                      {request.adminNotes && (
                        <p className="text-xs mt-2 p-2 bg-yellow-500/10 rounded text-yellow-800">
                          {request.adminNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={fetchRequests}
                disabled={loading}
                className="w-full mt-4 px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-6">
            <h3 className="font-semibold text-lg mb-3">🎨 Consultation</h3>
            <p className="text-on-surface-variant text-sm">
              Our expert fragrance consultants will review your preferences and
              reach out within 2-3 business days
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-6">
            <h3 className="font-semibold text-lg mb-3">🔬 Creation</h3>
            <p className="text-on-surface-variant text-sm">
              We carefully blend the finest ingredients to create a fragrance
              that matches your unique preferences
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-6">
            <h3 className="font-semibold text-lg mb-3">📦 Delivery</h3>
            <p className="text-on-surface-variant text-sm">
              Your custom fragrance will be securely packaged and delivered to
              your doorstep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bespoke;
