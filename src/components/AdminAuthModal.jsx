import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { verifyAdminPasskey } from "../services/projectService";

export default function AdminAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Listen for Ctrl + E (or Cmd + E on Mac) globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "e" || e.key === "E")) {
        e.preventDefault(); // Stop default browser search focus
        setIsOpen((prev) => !prev);
        setError("");
        setPassword("");
        setSuccess(false);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin passkey.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyAdminPasskey(password.trim());
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setPassword("");
          setSuccess(false);
          navigate("/admin");
        }, 600);
      } else {
        setError(result.error || "Access Denied: Invalid Passkey");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={() => setIsOpen(false)}>
      <div
        className={`admin-modal-card ${error ? "modal-shake" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="admin-modal-close"
          onClick={() => setIsOpen(false)}
          title="Close (Esc)"
        >
          <X size={18} />
        </button>

        <div className="admin-modal-icon">
          {success ? <ShieldCheck size={28} color="#a87cff" /> : <Lock size={28} color="#c2a4ff" />}
        </div>

        <h3 className="admin-modal-title">
          {success ? "ACCESS GRANTED" : "ADMIN PASSKEY"}
        </h3>
        <p className="admin-modal-desc">
          {success
            ? "Redirecting to Dashboard..."
            : "Enter your secret authorization key to manage portfolio projects."}
        </p>

        {!success && (
          <form onSubmit={handleSubmit} className="admin-modal-form">
            <div className="admin-input-wrap">
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                placeholder="Enter secret passkey..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="admin-input"
              />
              <button
                type="button"
                className="admin-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <div className="admin-error-text">{error}</div>}

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-cancel"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn-submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Unlock Dashboard"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
