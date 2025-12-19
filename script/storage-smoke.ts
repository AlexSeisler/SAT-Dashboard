import "dotenv/config";
import { storage } from "../server/storage";

async function test() {
  const student = await storage.getStudentByEmail("demo@satprep.com");
  console.log(student);
}

test().catch(console.error);