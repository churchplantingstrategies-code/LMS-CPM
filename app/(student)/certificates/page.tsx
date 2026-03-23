"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Award, Download, Share2, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  issuedDate: string;
  completionPercentage: number;
}

export default function CertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      redirect("/login");
    }

    fetchCertificates();
  }, [session]);

  async function fetchCertificates() {
    try {
      const res = await fetch("/api/student/certificates");
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const data = await res.json();
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Certificates</h1>
        <p className="text-gray-600 mt-2">
          Celebrate your achievements and completed courses
        </p>
      </div>

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <Card className="border-2 border-dashed bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-12 text-center">
          <Award className="h-16 w-16 mx-auto text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Complete your first course to earn a certificate. Start learning today!
          </p>
          <Button asChild>
            <a href="/courses">Browse Courses</a>
          </Button>
        </Card>
      )}

      {/* Certificates Grid */}
      {!loading && certificates.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group relative bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-xl border border-amber-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Decorative badge */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-bl-3xl opacity-20" />

              {/* Certificate content */}
              <div className="p-6 relative z-10">
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-12 w-12 text-amber-600" />
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>

                {/* Course name */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {cert.courseName}
                </h3>
                <p className="text-sm text-gray-600 mb-4">Course Certificate</p>

                {/* Completion */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-semibold text-gray-900">
                      {cert.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${cert.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Issued date */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Issued {new Date(cert.issuedDate).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-amber-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement download
                      alert("Download coming soon!");
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement share
                      alert("Share coming soon!");
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse rounded-lg h-40"
            />
          ))}
        </div>
      )}
    </div>
  );
}
