require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const { newId, randomHex } = require("./utils/crypto");
const didService = require("./services/didService");
const credentialService = require("./services/credentialService");

async function seed() {
  db.reset();

  // ---- Institution ----
  const { did: institutionDid, publicKey } = didService.generateDID("institution");
  const institution = {
    id: newId("INS"),
    name: "Delta State University",
    institutionCode: "DELSU",
    did: institutionDid,
    publicKey,
    issuerSecret: `issuer_${randomHex(24)}`,
    status: "active",
    vcName: "Prof. A. E. Okoro",
    registrarName: "Mrs. F. N. Adekunle"
  };
  db.insert("institutions", institution);

  // ---- University admin user ----
  const uniPasswordHash = bcrypt.hashSync("University@123", 10);
  const uniUser = {
    id: newId("USR"),
    name: "Delta State University Admin",
    email: "admin@delsu.edu.ng",
    passwordHash: uniPasswordHash,
    role: "university",
    institutionId: institution.id,
    createdAt: new Date().toISOString()
  };
  db.insert("users", uniUser);

  // ---- Employer / verifier demo user ----
  const empPasswordHash = bcrypt.hashSync("Employer@123", 10);
  const employerUser = {
    id: newId("USR"),
    name: "Marvel Tech Recruitment",
    email: "verifier@marveltech.com",
    passwordHash: empPasswordHash,
    role: "employer",
    createdAt: new Date().toISOString()
  };
  db.insert("users", employerUser);

  // ---- Demo students ----
  const studentsToCreate = [
    {
      fullName: "Chidinma Okafor",
      studentNumber: "DELSU/2021/CSC/014",
      programme: "B.Sc. Computer Science",
      department: "Computer Science",
      faculty: "Faculty of Science",
      email: "student@delsu.edu.ng",
      password: "Student@123"
    },
    {
      fullName: "Efe Emmanuel",
      studentNumber: "DELSU/2020/MCM/031",
      programme: "B.Sc. Mass Communication",
      department: "Mass Communication",
      faculty: "Faculty of Social Sciences",
      email: "efe.student@delsu.edu.ng",
      password: "Student@123"
    }
  ];

  const createdStudents = [];
  for (const s of studentsToCreate) {
    const { did } = didService.generateDID("student");
    const studentId = newId("STU");
    const passwordHash = bcrypt.hashSync(s.password, 10);
    const user = {
      id: newId("USR"),
      name: s.fullName,
      email: s.email,
      passwordHash,
      role: "student",
      studentRecordId: studentId,
      institutionId: institution.id,
      createdAt: new Date().toISOString()
    };
    db.insert("users", user);

    const student = {
      id: studentId,
      userId: user.id,
      studentId: s.studentNumber,
      fullName: s.fullName,
      programme: s.programme,
      department: s.department,
      faculty: s.faculty,
      did,
      institutionId: institution.id,
      status: "active",
      dateRegistered: new Date().toISOString()
    };
    db.insert("students", student);
    createdStudents.push(student);
  }

  // ---- Issue a couple of demo credentials ----
  const cred1 = await credentialService.issueCredential({
    student: createdStudents[0],
    institution,
    academic: {
      qualification: "B.Sc. Computer Science (Second Class Upper)",
      credentialType: "Bachelor's Degree",
      faculty: createdStudents[0].faculty,
      department: createdStudents[0].department,
      programme: createdStudents[0].programme,
      graduationDate: "2025-11-14",
      gpa: "4.42",
      dateOfBirth: "2000-03-18"
    }
  });

  const cred2 = await credentialService.issueCredential({
    student: createdStudents[1],
    institution,
    academic: {
      qualification: "B.Sc. Mass Communication (First Class)",
      credentialType: "Bachelor's Degree",
      faculty: createdStudents[1].faculty,
      department: createdStudents[1].department,
      programme: createdStudents[1].programme,
      graduationDate: "2024-11-22",
      gpa: "4.71",
      dateOfBirth: "1999-07-02"
    }
  });

  // Revoke the second one to demonstrate the revoked flow
  credentialService.revokeCredential(cred2.credentialId, "Issued in error - duplicate record");

  console.log("Seed complete.\n");
  console.log("Demo accounts:");
  console.log("  University : admin@delsu.edu.ng / University@123");
  console.log(`  Student    : ${studentsToCreate[0].email} / Student@123`);
  console.log(`  Student 2  : ${studentsToCreate[1].email} / Student@123`);
  console.log("  Employer   : verifier@marveltech.com / Employer@123\n");
  console.log("Sample credential IDs to verify on the public page:");
  console.log(`  VALID   -> ${cred1.credentialId}`);
  console.log(`  REVOKED -> ${cred2.credentialId}`);
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
