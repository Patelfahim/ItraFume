import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/ProtectedRoute";

const STATUSES = [
  "pending",
  "in-review",
  "approved",
  "in-production",
  "completed",
  "rejected",
];

const statusTone = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-review": "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  "in-production": "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const emptyDraft = {
  status: "",
  adminNotes: "",
  estimatedDelivery: "",
  linkedProduct: "",
  linkedOrder: "",
};

const BespokeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [savingIds, setSavingIds] = useState({});
  const [drafts, setDrafts] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bespoke/admin/all-requests", {
        params: { status: filterStatus || undefined },
      });
      setRequests(data.data?.requests || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const getDraft = (req) => {
    const existing = drafts[req._id];
    if (existing) return existing;
    return {
      status: req.status || "",
      adminNotes: req.adminNotes || "",
      estimatedDelivery: req.estimatedDelivery
        ? new Date(req.estimatedDelivery).toISOString().slice(0, 10)
        : "",
      linkedProduct: req.linkedProduct?._id
        ? req.linkedProduct._id
        : req.linkedProduct || "",
      linkedOrder: req.linkedOrder?._id
        ? req.linkedOrder._id
        : req.linkedOrder || "",
    };
  };

  const setDraftField = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...getDraft(requests.find((r) => r._id === id)), [field]: value },
    }));
  };

  const canSave = (id) => {
    const d = drafts[id];
    if (!d) return false;
    return Boolean(d.status || d.adminNotes || d.estimatedDelivery);
  };

  const save = async (id) => {
    const req = requests.find((r) => r._id === id);
    if (!req) return;

    const d = drafts[id] || getDraft(req);

    // Minimal validation: require adminNotes when setting completed/rejected? (backend doesn't require, so keep permissive)
    setSavingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/bespoke/admin/${id}`, {
        status: d.status || undefined,
        adminNotes: d.adminNotes || undefined,
        estimatedDelivery: d.estimatedDelivery
          ? new Date(d.estimatedDelivery).toISOString()
          : undefined,
        linkedProduct: d.linkedProduct || undefined,
        linkedOrder: d.linkedOrder || undefined,
      });

      toast.success("Bespoke request updated (email sent if applicable).");
      // Refresh to reflect latest saved status/adminNotes
      await fetchRequests();
      setDrafts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredEmptyText = useMemo(() => {
    if (!filterStatus) return "No bespoke requests yet.";
    return "No bespoke requests match this status.";
  }, [filterStatus]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-secondary">
            Bespoke
          </p>
          <h1 className="font-display mt-2 text-3xl">Requests</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            View and update customer bespoke requests. Admin notes are used for
            the status update email.
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-56"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </header>

      {requests.length === 0 ? (
        <div className="admin-surface p-10 text-center text-sm text-on-surface-variant">
          {filteredEmptyText}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const d = getDraft(r);
            return (
              <div
                key={r._id}
                className="bg-surface-container-lowest rounded-md p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.customerName}{" "}
                      <span className="text-xs text-on-surface-variant">
                        ({r.email})
                      </span>
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Phone: {r.phone}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Requested: {new Date(r.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      statusTone[r.status] || "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-md bg-surface-container-low p-4 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Preferences
                    </p>
                    <p>
                      <span className="text-on-surface-variant">Occasion:</span>{" "}
                      {r.occasion || "-"}
                    </p>
                    <p>
                      <span className="text-on-surface-variant">Budget:</span>{" "}
                      {r.budgetRange || "-"}
                    </p>
                    <p>
                      <span className="text-on-surface-variant">
                        Concentration:
                      </span>{" "}
                      {r.concentration || "-"}
                    </p>
                    <p>
                      <span className="text-on-surface-variant">
                        Intensity:
                      </span>{" "}
                      {r.intensity || "-"}
                    </p>
                    <p>
                      <span className="text-on-surface-variant">Gender:</span>{" "}
                      {r.gender || "-"}
                    </p>
                    <p>
                      <span className="text-on-surface-variant">Quantity:</span>{" "}
                      {r.quantity || "-"}
                    </p>
                    {(r.preferredTopNotes?.length ||
                      r.preferredMiddleNotes?.length ||
                      r.preferredBaseNotes?.length) && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                          Notes
                        </p>
                        <p className="text-on-surface-variant">
                          Top: {r.preferredTopNotes?.join(", ") || "-"}
                        </p>
                        <p className="text-on-surface-variant">
                          Middle: {r.preferredMiddleNotes?.join(", ") || "-"}
                        </p>
                        <p className="text-on-surface-variant">
                          Base: {r.preferredBaseNotes?.join(", ") || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-md bg-surface-container-low p-4 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Admin reply / update
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                          Status
                        </label>
                        <select
                          value={d.status}
                          onChange={(e) =>
                            setDraftField(r._id, "status", e.target.value)
                          }
                          className="input-field w-full text-sm"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                          Admin notes (used in email when completed/rejected)
                        </label>
                        <textarea
                          value={d.adminNotes}
                          onChange={(e) =>
                            setDraftField(r._id, "adminNotes", e.target.value)
                          }
                          placeholder="Add notes for the customer..."
                          className="input-field h-24 w-full text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                            Estimated delivery (optional)
                          </label>
                          <input
                            type="date"
                            value={d.estimatedDelivery}
                            onChange={(e) =>
                              setDraftField(
                                r._id,
                                "estimatedDelivery",
                                e.target.value,
                              )
                            }
                            className="input-field w-full text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                            Linked product (optional)
                          </label>
                          <input
                            value={d.linkedProduct}
                            onChange={(e) =>
                              setDraftField(
                                r._id,
                                "linkedProduct",
                                e.target.value,
                              )
                            }
                            placeholder="ProductId"
                            className="input-field w-full text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                          Linked order (optional)
                        </label>
                        <input
                          value={d.linkedOrder}
                          onChange={(e) =>
                            setDraftField(r._id, "linkedOrder", e.target.value)
                          }
                          placeholder="OrderId"
                          className="input-field w-full text-sm"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <p className="text-xs text-on-surface-variant">
                          Email updates are sent by the backend when status is
                          patched.
                        </p>
                        <button
                          onClick={() => save(r._id)}
                          disabled={!!savingIds[r._id] || !canSave(r._id)}
                          className="btn-primary text-sm px-4"
                        >
                          {savingIds[r._id] ? "Saving..." : "Save Update"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BespokeRequests;
