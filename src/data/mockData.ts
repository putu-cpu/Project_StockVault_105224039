import type { HotelPartner, Item, User } from "../types";

export const hotelPartners: HotelPartner[] = [
  { id: "grand-hyatt", name: "Grand Hyatt Bali", location: "Nusa Dua, Bali" },
  { id: "ayana-resort", name: "Ayana Resort Bali", location: "Jimbaran, Bali" },
];

export const catalog: Item[] = [
  { id: "soap-natural-100", name: "Natural Soap 100g", category: "SOAP", size: "100g", unitPrice: 42_000 },
  { id: "toner-moist-125", name: "Face Toner Moist 125ml", category: "FACE CARE", size: "125ml", unitPrice: 75_000 },
  { id: "body-soap-pump-500", name: "Liquid Body Soap 500ml Pump", category: "BODY CARE", size: "500ml", unitPrice: 78_000 },
  { id: "massage-oil-100", name: "Massage Oil 100ml", category: "BODY CARE", size: "100ml", unitPrice: 57_000 },
  { id: "shampoo-pump-500", name: "Shampoo 500ml Pump", category: "HAIR CARE", size: "500ml", unitPrice: 78_000 },
  { id: "citronella-oil-20", name: "Essential Oil Citronella 20ml", category: "AROMA", size: "20ml", unitPrice: 56_000 },
];

export const currentUser: User = {
  id: "user-seller-01",
  name: "Nadia Putri",
  email: "seller@alamzempol.com",
  role: "SELLER",
};

export const demoUsers: User[] = [
  currentUser,
  { id: "user-grand-hyatt", name: "Maya Pratama", email: "hotel@grandhyatt.com", role: "BUYER", hotelId: "grand-hyatt" },
  { id: "user-ayana", name: "Rani Wirawan", email: "hotel@ayana.com", role: "BUYER", hotelId: "ayana-resort" },
];

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}