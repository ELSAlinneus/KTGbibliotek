/**
 * @jest-environment node
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesPath = path.resolve(process.cwd(), "../terraform/firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");

  testEnv = await initializeTestEnvironment({
    projectId: "demo-ktg-bibliotek",
    firestore: {
      rules,
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore Security Rules", () => {
  const ALICE_UID = "alice-123";
  const BOB_UID = "bob-456";

  const sampleBook = {
    Title: "Kallocain",
    Author: "Karin Boye",
    Owner: ALICE_UID,
  };

  describe("/Books", () => {
    it("tillåter vem som helst (även oinloggade) att läsa böcker", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "Books", "b1"), sampleBook);
      });

      const guestDb = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(getDoc(doc(guestDb, "Books", "b1")));
    });

    it("tillåter inloggade användare att skapa böcker", async () => {
      const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
      await assertSucceeds(setDoc(doc(aliceDb, "Books", "b1"), sampleBook));
    });

    it("nekar oinloggade att skapa böcker", async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(setDoc(doc(guestDb, "Books", "b1"), sampleBook));
    });

    it("tillåter inloggade att uppdatera och radera böcker", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "Books", "b1"), sampleBook);
      });

      const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();
      await assertSucceeds(updateDoc(doc(bobDb, "Books", "b1"), { Borrowed: true }));
      await assertSucceeds(deleteDoc(doc(bobDb, "Books", "b1")));
    });
  });

  describe("/users", () => {
    it("tillåter alla att läsa användare och inloggade att skriva", async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();

      await assertSucceeds(setDoc(doc(aliceDb, "users", ALICE_UID), { username: "Alice" }));
      await assertSucceeds(getDoc(doc(guestDb, "users", ALICE_UID)));
      await assertFails(setDoc(doc(guestDb, "users", "guest"), { username: "Guest" }));
    });
  });
});