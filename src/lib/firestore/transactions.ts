import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TRANSACTIONS_COLLECTION = "transactions";

export async function deleteTransaction(transactionId: string): Promise<void> {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
}
