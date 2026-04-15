import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

export interface Template {
  id?: string;
  title: string;
  category: string;
  language: string;
  description: string;
  htmlContent: string;
  fields: string; // JSON string
  published: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = "templates";

export async function getAllTemplates() {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
}

export async function getTemplate(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Template not found");
  return { id: snapshot.id, ...snapshot.data() } as Template;
}

export async function createTemplate(template: Omit<Template, "id" | "createdAt">) {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...template,
    createdAt: serverTimestamp()
  });
}

export async function updateTemplate(id: string, template: Partial<Template>) {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, template);
}

export async function deleteTemplate(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
}

export async function togglePublishTemplate(id: string, published: boolean) {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, { published });
}
