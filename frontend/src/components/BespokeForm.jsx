import { useState } from "react";
import toast from "react-hot-toast";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import api from "../api/axios";

const BespokeForm = () => {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    preferredTopNotes: [],
    preferredMiddleNotes: [],
    preferredBaseNotes: [],
    concentration: "Eau de Parfum",
    intensity: "moderate",
    occasion: "",
    gender: "unisex",
    budgetRange: "",
    quantity: "10ml",
    allergies: "",
    additionalRequirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fragranceNotes = {
    top: [
      "Bergamot",
      "Lemon",
      "Orange",
      "Grapefruit",
      "Lavender",
      "Mint",
      "Anise",
      "Cinnamon",
    ],
    middle: [
      "Rose",
      "Jasmine",
      "Carnation",
      "Iris",
      "Vanilla",
      "Sandalwood",
      "Musk",
      "Amber",
      "Patchouli",
      "Oud",
    ],
    base: [
      "Cedarwood",
      "Vetiver",
      "Sandalwood",
      "Musk",
      "Amber",
      "Vanilla",
      "Tonka",
      "Leather",
      "Tobacco",
    ],
  };

  const handleNoteChange = (type, note) => {
    const field = `preferred${type.charAt(0).toUpperCase() + type.slice(1)}Notes`;
    const notes = form[field];
    if (notes.includes(note)) {
      setForm({ ...form, [field]: notes.filter((n) => n !== note) });
    } else {
      setForm({ ...form, [field]: [...notes, note] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.customerName ||
      !form.email ||
      !form.phone ||
      !form.occasion ||
      !form.budgetRange
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/bespoke/create-request", form);
      toast.success(
        "Bespoke request submitted! We'll review and contact you soon.",
      );
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setForm({
        customerName: "",
        email: "",
        phone: "",
        preferredTopNotes: [],
        preferredMiddleNotes: [],
        preferredBaseNotes: [],
        concentration: "Eau de Parfum",
        intensity: "moderate",
        occasion: "",
        gender: "unisex",
        budgetRange: "",
        quantity: "10ml",
        allergies: "",
        additionalRequirements: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-8">
      <h2 className="font-display text-2xl mb-2">
        Create Your Perfect Fragrance
      </h2>
      <p className="text-on-surface-variant mb-8">
        Tell us your preferences and our experts will craft a bespoke fragrance
        just for you
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Your Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Full Name *"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              className="input-field"
            />
            <input
              required
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
            <input
              required
              type="tel"
              placeholder="Phone Number *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field col-span-1 sm:col-span-2"
            />
          </div>
        </div>

        {/* Fragrance Preferences */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Fragrance Preferences</h3>

          {/* Top Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Preferred Top Notes (Opening Scent)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fragranceNotes.top.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => handleNoteChange("top", note)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                    form.preferredTopNotes.includes(note)
                      ? "bg-primary text-white border-primary"
                      : "border-surface-container-high hover:border-primary"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Middle Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Preferred Middle Notes (Heart)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fragranceNotes.middle.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => handleNoteChange("middle", note)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                    form.preferredMiddleNotes.includes(note)
                      ? "bg-primary text-white border-primary"
                      : "border-surface-container-high hover:border-primary"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Base Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Preferred Base Notes (Foundation)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {fragranceNotes.base.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => handleNoteChange("base", note)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                    form.preferredBaseNotes.includes(note)
                      ? "bg-primary text-white border-primary"
                      : "border-surface-container-high hover:border-primary"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Concentration
              </label>
              <select
                value={form.concentration}
                onChange={(e) =>
                  setForm({ ...form, concentration: e.target.value })
                }
                className="input-field"
              >
                <option>Eau de Cologne</option>
                <option>Eau de Toilette</option>
                <option>Eau de Parfum</option>
                <option>Parfum Oil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Intensity
              </label>
              <select
                value={form.intensity}
                onChange={(e) =>
                  setForm({ ...form, intensity: e.target.value })
                }
                className="input-field"
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="input-field"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <select
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field"
              >
                <option>10ml</option>
                <option>30ml</option>
                <option>50ml</option>
                <option>100ml</option>
              </select>
            </div>
          </div>
        </div>

        {/* Occasion & Budget */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Occasion & Budget</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Occasion (e.g., Daily Wear, Evening, Office) *"
              value={form.occasion}
              onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              className="input-field"
            />
            <select
              required
              value={form.budgetRange}
              onChange={(e) =>
                setForm({ ...form, budgetRange: e.target.value })
              }
              className="input-field"
            >
              <option value="">Select Budget Range *</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="1000-2000">₹1000 - ₹2000</option>
              <option value="2000-5000">₹2000 - ₹5000</option>
              <option value="5000+">₹5000+</option>
            </select>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Additional Information</h3>
          <div className="space-y-4">
            <textarea
              placeholder="Any allergies or ingredients to avoid?"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="input-field h-24"
            />
            <textarea
              placeholder="Any special requirements or additional notes?"
              value={form.additionalRequirements}
              onChange={(e) =>
                setForm({ ...form, additionalRequirements: e.target.value })
              }
              className="input-field h-24"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || submitted}
          className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70"
        >
          {submitted ? (
            <>
              <FiCheck className="w-5 h-5" />
              Request Submitted!
            </>
          ) : loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              Submit Bespoke Request
              <FiArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-sm text-on-surface-variant text-center">
          Our fragrance experts will review your request and contact you within
          2-3 business days with personalized recommendations.
        </p>
      </form>
    </div>
  );
};

export default BespokeForm;
