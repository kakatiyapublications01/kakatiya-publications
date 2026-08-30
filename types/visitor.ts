export type VisitorTitle = "Mr." | "Ms." | "Mrs." | "Dr." | "Other";

export type LocationPermissionState = "granted" | "denied" | "skipped" | "unsupported";

export interface VisitorPayload {
  title: VisitorTitle;
  fullName: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  locationPermission: LocationPermissionState;
  timezone: string;
}

export interface Visitor extends VisitorPayload {
  visitorId: string;
  createdAt: string;
  lastVisitAt: string;
}

export interface StoredVisitor {
  visitorId: string;
  title: VisitorTitle;
  fullName: string;
}
