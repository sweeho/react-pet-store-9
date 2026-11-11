export interface CustomerValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  cardType: string;
  cardNumber: string;
  cardExpiry: string;
  language: string;
  favoriteCategory: string;
  myList: boolean;
  banner: boolean;
}

export const EMPTY_CUSTOMER: CustomerValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA",
  cardType: "Visa",
  cardNumber: "",
  cardExpiry: "",
  language: "en_US",
  favoriteCategory: "",
  myList: true,
  banner: true,
};
