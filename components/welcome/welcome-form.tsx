"use client";

import React, { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  User,
} from "lucide-react";
import { VisitorTitle, LocationPermissionState, VisitorPayload } from "@/types/visitor";

interface WelcomeFormProps {
  onSubmit: (payload: VisitorPayload) => Promise<void>;
  isSubmitting: boolean;
}

export function WelcomeForm({ onSubmit, isSubmitting }: WelcomeFormProps) {
  const [title, setTitle] = useState<VisitorTitle>("Mr.");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Location state
  const [locationState, setLocationState] = useState<{
    status: "idle" | "requesting" | "granted" | "denied" | "skipped";
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
  }>({
    status: "idle",
    lat: null,
    lng: null,
    accuracy: null,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({ status: "denied", lat: null, lng: null, accuracy: null });
      return;
    }

    setLocationState({ status: "requesting", lat: null, lng: null, accuracy: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          status: "granted",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn("Geolocation permission error/denied:", error.message);
        setLocationState({
          status: "denied",
          lat: null,
          lng: null,
          accuracy: null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSkipLocation = () => {
    setLocationState({
      status: "skipped",
      lat: null,
      lng: null,
      accuracy: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }

    if (!agreed) {
      setValidationError("Please check the box to agree to our privacy terms.");
      return;
    }

    let permission: LocationPermissionState = "skipped";
    if (locationState.status === "granted") permission = "granted";
    else if (locationState.status === "denied") permission = "denied";
    else if (locationState.status === "skipped") permission = "skipped";
    else permission = "skipped";

    const userTimezone =
      typeof Intl !== "undefined" && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC";

    const payload: VisitorPayload = {
      title,
      fullName: fullName.trim(),
      email: email.trim(),
      address: address.trim(),
      latitude: locationState.lat,
      longitude: locationState.lng,
      locationAccuracy: locationState.accuracy,
      locationPermission: permission,
      timezone: userTimezone,
    };

    await onSubmit(payload);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#E5E5E0] rounded-xl p-6 sm:p-10 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="relative w-20 h-20 mx-auto mb-3 p-1 rounded-full bg-[#F8F7F3] border border-[#E5E5E0]">
          <img
            src="/logo.png"
            alt="KakatiyaPulse"
            className="w-full h-full object-contain p-1"
          />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#C9A227]">
          Welcome to KakatiyaPulse
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] tracking-tight">
          Personalized Reader Profile
        </h2>
        <p className="text-[#555555] text-sm leading-relaxed max-w-md mx-auto">
          Before exploring our publication, please tell us a little about yourself.
        </p>
        <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent pt-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title & Full Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-[#1C1C1C] uppercase tracking-wider mb-1.5">
              Title
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value as VisitorTitle)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D]/40 transition-colors"
            >
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-8">
            <label className="block text-xs font-medium text-[#1C1C1C] uppercase tracking-wider mb-1.5">
              Full Name <span className="text-[#C9A227]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Gowtham"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D]/40 transition-colors"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-medium text-[#1C1C1C] uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D]/40 transition-colors"
            />
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-[#1C1C1C] uppercase tracking-wider mb-1.5">
            Address / City
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Jubilee Hills, Hyderabad"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D]/40 transition-colors"
            />
            <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Location Section */}
        <div className="pt-2 border-t border-[#E5E5E0]">
          <label className="block text-xs font-medium text-[#1C1C1C] uppercase tracking-wider mb-2">
            Location <span className="text-[#555555] font-normal lowercase">(optional)</span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F7F3] p-3 rounded-md border border-[#E5E5E0]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={locationState.status === "requesting" || locationState.status === "granted"}
                className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-md bg-white text-[#14532D] border border-[#14532D]/40 hover:bg-[#14532D]/5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#14532D]" />
                {locationState.status === "requesting"
                  ? "Detecting..."
                  : locationState.status === "granted"
                  ? "Location Attached"
                  : "Use my location"}
              </button>

              {locationState.status === "granted" && (
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Captured
                </span>
              )}

              {locationState.status === "denied" && (
                <span className="text-xs text-[#555555] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C9A227]" /> Permission skipped
                </span>
              )}

              {locationState.status === "skipped" && (
                <span className="text-xs text-[#555555]">Skipped</span>
              )}
            </div>

            {locationState.status !== "skipped" && locationState.status !== "granted" && (
              <button
                type="button"
                onClick={handleSkipLocation}
                className="text-xs text-[#555555] hover:text-[#14532D] underline underline-offset-2 transition-colors cursor-pointer"
              >
                Skip location
              </button>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-[#F8F7F3] p-3.5 rounded-md border border-[#E5E5E0] space-y-2 text-xs text-[#555555]">
          <p className="flex items-start gap-2 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
            Your information is used only to personalize your experience on KakatiyaPulse and improve our services.
          </p>

          <label className="flex items-center gap-2.5 pt-1 text-[#1C1C1C] font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E5E0] text-[#14532D] focus:ring-[#14532D]/40"
            />
            <span>I agree to share my details for this purpose.</span>
          </label>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-md text-center">
            {validationError}
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 font-serif text-base font-semibold px-6 py-3 rounded-md bg-[#14532D] text-white hover:bg-[#166534] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving Profile...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
