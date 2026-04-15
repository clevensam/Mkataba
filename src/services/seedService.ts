import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from "firebase/firestore";

const templates = [
  {
    title: "Residential Rental Agreement",
    category: "rental",
    language: "ENGLISH",
    description: "A standard residential lease agreement for houses or apartments in Tanzania.",
    htmlContent: `
      <h2 style="text-align: center;">RESIDENTIAL RENTAL AGREEMENT</h2>
      <p>This agreement is made on <strong>{{agreement_date}}</strong>, between <strong>{{landlord_name}}</strong> (ID: {{landlord_id}}) hereinafter referred to as the "Landlord", and <strong>{{tenant_name}}</strong> (ID: {{tenant_id}}) hereinafter referred to as the "Tenant".</p>
      <p>The Landlord agrees to rent to the Tenant the premises located at <strong>{{property_address}}</strong> for residential purposes only.</p>
      <p>The term of this lease shall be for <strong>{{lease_term}}</strong> months, starting from {{start_date}}.</p>
      <p>The monthly rent shall be <strong>TZS {{rent_amount}}</strong>, payable in advance on the first day of each month.</p>
      <p>A security deposit of TZS {{deposit_amount}} shall be paid by the Tenant upon signing this agreement.</p>
      <br/><br/>
      <div style="display: flex; justify-content: space-between;">
        <div>
          <p>__________________________</p>
          <p>Landlord Signature</p>
        </div>
        <div>
          <p>__________________________</p>
          <p>Tenant Signature</p>
        </div>
      </div>
    `,
    fields: JSON.stringify([
      { id: "agreement_date", label: "Agreement Date", type: "text" },
      { id: "landlord_name", label: "Landlord Name", type: "text" },
      { id: "landlord_id", label: "Landlord ID/NIDA", type: "text" },
      { id: "tenant_name", label: "Tenant Name", type: "text" },
      { id: "tenant_id", label: "Tenant ID/NIDA", type: "text" },
      { id: "property_address", label: "Property Address", type: "text" },
      { id: "lease_term", label: "Lease Term (Months)", type: "number" },
      { id: "start_date", label: "Start Date", type: "text" },
      { id: "rent_amount", label: "Monthly Rent (TZS)", type: "number" },
      { id: "deposit_amount", label: "Security Deposit (TZS)", type: "number" },
    ]),
    published: true,
    createdAt: serverTimestamp(),
  },
  {
    title: "Vehicle Sale Agreement",
    category: "car_sale",
    language: "ENGLISH",
    description: "Legal document for the sale of a motor vehicle between two private parties.",
    htmlContent: `
      <h2 style="text-align: center;">VEHICLE SALE AGREEMENT</h2>
      <p>This agreement is made on {{sale_date}} between {{seller_name}} (Seller) and {{buyer_name}} (Buyer).</p>
      <p>The Seller agrees to sell and the Buyer agrees to buy the following vehicle:</p>
      <ul>
        <li>Make: {{vehicle_make}}</li>
        <li>Model: {{vehicle_model}}</li>
        <li>Registration Number: {{reg_number}}</li>
        <li>Chassis Number: {{chassis_number}}</li>
      </ul>
      <p>The total purchase price is <strong>TZS {{purchase_price}}</strong>.</p>
      <p>The vehicle is sold "as is" and the Seller disclaims any implied warranties.</p>
      <br/><br/>
      <p>Seller Signature: __________________________</p>
      <p>Buyer Signature: __________________________</p>
    `,
    fields: JSON.stringify([
      { id: "sale_date", label: "Sale Date", type: "text" },
      { id: "seller_name", label: "Seller Name", type: "text" },
      { id: "buyer_name", label: "Buyer Name", type: "text" },
      { id: "vehicle_make", label: "Vehicle Make", type: "text" },
      { id: "vehicle_model", label: "Vehicle Model", type: "text" },
      { id: "reg_number", label: "Registration Number", type: "text" },
      { id: "chassis_number", label: "Chassis Number", type: "text" },
      { id: "purchase_price", label: "Purchase Price (TZS)", type: "number" },
    ]),
    published: true,
    createdAt: serverTimestamp(),
  }
];

export async function seedTemplates() {
  const q = query(collection(db, "templates"), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Seeding templates...");
    for (const template of templates) {
      await addDoc(collection(db, "templates"), template);
    }
    return true;
  }
  return false;
}
