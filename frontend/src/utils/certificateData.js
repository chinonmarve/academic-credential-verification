export function normalizeCredentialForCertificate(credential) {
  const get = (key, fallback = "") => {
    if (credential?.fields && key in credential.fields) return credential.fields[key];
    if (credential?.committedFields && credential.committedFields[key]) return credential.committedFields[key].value;
    return fallback;
  };

  const graduationDate = credential?.graduationDate || get("graduationDate", "");
  const graduationYear = graduationDate ? new Date(`${graduationDate}T00:00:00`).getFullYear() : get("graduationYear", "");

  return {
    credentialId: credential?.credentialId || "",
    status: credential?.status || "active",
    issueDate: credential?.issueDate || get("issuanceDate", ""),
    qrDataUrl: credential?.qrDataUrl || "",
    institutionName: get("institution", "Delta State University"),
    studentName: get("studentName", ""),
    matricNumber: get("studentIdNumber", ""),
    studentDid: credential?.studentDid || get("studentDid", ""),
    qualification: credential?.qualification || get("qualification", ""),
    programme: get("programme", ""),
    graduationYear,
    graduationDate,
    gpa: get("gpa", "")
  };
}
