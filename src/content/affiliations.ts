// Affiliations an EMPLOYEE can pick when registering (spec 003 BR-04).
// Placeholder list: the full list of offices and its owner are still an open
// question in spec 003 §7. Codes are stored in the database, so keep them
// stable when relabelling.

export type Affiliation = { code: string; label: string };

export const affiliations: Affiliation[] = [
  { code: "HQ", label: "สำนักงานใหญ่" },
  { code: "N1", label: "การไฟฟ้าส่วนภูมิภาคเขต 1 (ภาคเหนือ)" },
  { code: "N2", label: "การไฟฟ้าส่วนภูมิภาคเขต 2 (ภาคเหนือ)" },
  { code: "N3", label: "การไฟฟ้าส่วนภูมิภาคเขต 3 (ภาคเหนือ)" },
  { code: "NE1", label: "การไฟฟ้าส่วนภูมิภาคเขต 1 (ภาคตะวันออกเฉียงเหนือ)" },
  { code: "NE2", label: "การไฟฟ้าส่วนภูมิภาคเขต 2 (ภาคตะวันออกเฉียงเหนือ)" },
  { code: "NE3", label: "การไฟฟ้าส่วนภูมิภาคเขต 3 (ภาคตะวันออกเฉียงเหนือ)" },
  { code: "C1", label: "การไฟฟ้าส่วนภูมิภาคเขต 1 (ภาคกลาง)" },
  { code: "C2", label: "การไฟฟ้าส่วนภูมิภาคเขต 2 (ภาคกลาง)" },
  { code: "C3", label: "การไฟฟ้าส่วนภูมิภาคเขต 3 (ภาคกลาง)" },
  { code: "S1", label: "การไฟฟ้าส่วนภูมิภาคเขต 1 (ภาคใต้)" },
  { code: "S2", label: "การไฟฟ้าส่วนภูมิภาคเขต 2 (ภาคใต้)" },
  { code: "S3", label: "การไฟฟ้าส่วนภูมิภาคเขต 3 (ภาคใต้)" },
];
