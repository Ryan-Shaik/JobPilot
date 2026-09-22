import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

export type ResumePDFData = {
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  currentTitle?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  summary?: string | null;
  workExperience: Array<{
    company: string;
    jobTitle: string;
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isCurrent?: boolean;
    bullets?: string[];
  }>;
  education?: {
    highestDegree?: string;
    fieldOfStudy?: string;
    institutionName?: string;
    graduationYear?: string;
  } | null;
  skills: string[];
  industries?: string[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1E293B",
    lineHeight: 1.3,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0F172A",
    paddingBottom: 8,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  title: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
    marginBottom: 6,
    lineHeight: 1.25,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    fontSize: 8,
    color: "#475569",
  },
  contactItem: {
    marginRight: 6,
  },
  contactLink: {
    color: "#2563EB",
    textDecoration: "none",
  },
  dividerDot: {
    marginHorizontal: 4,
    color: "#94A3B8",
  },
  section: {
    marginBottom: 9,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    borderBottomWidth: 0.75,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 2,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.35,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 6,
  },
  expHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  expRoleCompany: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
    flexWrap: "wrap",
  },
  expRole: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  expCompany: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: "#475569",
    marginLeft: 4,
  },
  expDates: {
    fontSize: 8,
    color: "#64748B",
    textAlign: "right",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    paddingLeft: 6,
  },
  bulletPoint: {
    width: 8,
    fontSize: 7.5,
    color: "#2563EB",
    marginTop: 0.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.2,
    color: "#334155",
    lineHeight: 1.3,
  },
  educationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  degreeSchool: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
  },
  degreeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  schoolText: {
    fontSize: 8.5,
    color: "#475569",
    marginLeft: 4,
  },
  eduYear: {
    fontSize: 8,
    color: "#64748B",
  },
  skillsGroup: {
    marginBottom: 3,
  },
  skillsLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  skillsContent: {
    fontSize: 8.3,
    color: "#334155",
    lineHeight: 1.35,
  },
});

function formatDegreeLabel(degree?: string): string {
  if (!degree) return "";
  const map: Record<string, string> = {
    high_school: "High School Diploma",
    associate: "Associate Degree",
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    phd: "Ph.D.",
    bootcamp: "Bootcamp Certificate",
    other: "Certificate / Degree",
  };
  return map[degree] || degree;
}

export function ResumeDocument({ data }: { data: ResumePDFData }) {
  const contactParts: React.ReactNode[] = [];

  if (data.email) {
    contactParts.push(
      <Text key="email" style={styles.contactItem}>{data.email}</Text>
    );
  }
  if (data.phone) {
    contactParts.push(
      <Text key="phone" style={styles.contactItem}>{data.phone}</Text>
    );
  }
  if (data.location) {
    contactParts.push(
      <Text key="location" style={styles.contactItem}>{data.location}</Text>
    );
  }
  if (data.linkedinUrl) {
    const cleanUrl = data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "in/");
    contactParts.push(
      <Link key="linkedin" src={data.linkedinUrl} style={styles.contactLink}>
        {cleanUrl}
      </Link>
    );
  }
  if (data.portfolioUrl) {
    const cleanUrl = data.portfolioUrl.replace(/^https?:\/\/(www\.)?/, "");
    contactParts.push(
      <Link key="portfolio" src={data.portfolioUrl} style={styles.contactLink}>
        {cleanUrl}
      </Link>
    );
  }

  const hasEducation =
    data.education &&
    data.education.highestDegree &&
    data.education.highestDegree !== "none" &&
    (data.education.institutionName || data.education.fieldOfStudy);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
          {data.currentTitle && (
            <Text style={styles.title}>{data.currentTitle}</Text>
          )}
          <View style={styles.contactRow}>
            {contactParts.map((part, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Text style={styles.dividerDot}>•</Text>}
                {part}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Executive Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {data.workExperience && data.workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.workExperience.map((exp, idx) => {
              const startStr = [exp.startMonth, exp.startYear].filter(Boolean).join(" ");
              const endStr = exp.isCurrent
                ? "Present"
                : [exp.endMonth, exp.endYear].filter(Boolean).join(" ");
              const dateRange = [startStr, endStr].filter(Boolean).join(" – ");

              return (
                <View key={idx} style={styles.experienceItem}>
                  <View style={styles.expHeaderRow}>
                    <View style={styles.expRoleCompany}>
                      <Text style={styles.expRole}>{exp.jobTitle || "Role"}</Text>
                      {exp.company && (
                        <Text style={styles.expCompany}>| {exp.company}</Text>
                      )}
                    </View>
                    {dateRange && <Text style={styles.expDates}>{dateRange}</Text>}
                  </View>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <View>
                      {exp.bullets.map((bullet, bIdx) => (
                        <View key={bIdx} style={styles.bulletRow}>
                          <Text style={styles.bulletPoint}>▪</Text>
                          <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Competencies</Text>
            <View style={styles.skillsGroup}>
              <Text style={styles.skillsContent}>
                <Text style={styles.skillsLabel}>Key Skills: </Text>
                {data.skills.join(", ")}
              </Text>
            </View>
            {data.industries && data.industries.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsContent}>
                  <Text style={styles.skillsLabel}>Industries & Domains: </Text>
                  {data.industries.join(", ")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Education */}
        {hasEducation && data.education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education & Credentials</Text>
            <View style={styles.educationItem}>
              <View style={styles.degreeSchool}>
                <Text style={styles.degreeText}>
                  {formatDegreeLabel(data.education.highestDegree)}
                  {data.education.fieldOfStudy ? ` in ${data.education.fieldOfStudy}` : ""}
                </Text>
                {data.education.institutionName && (
                  <Text style={styles.schoolText}>
                    | {data.education.institutionName}
                  </Text>
                )}
              </View>
              {data.education.graduationYear && (
                <Text style={styles.eduYear}>{data.education.graduationYear}</Text>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
