"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/students/certificates');
      // const data = await response.json();

      const mockCertificates = [
        {
          id: "cert-1",
          course_id: "1",
          course_title: "TypeScript Fundamentals",
          instructor_name: "Mike Johnson",
          completion_date: "2024-11-10",
          certificate_id: "CERT-2024-001234",
          certificate_url: "/certificates/cert-1.pdf",
        },
        {
          id: "cert-2",
          course_id: "2",
          course_title: "Advanced React Patterns",
          instructor_name: "John Doe",
          completion_date: "2024-10-15",
          certificate_id: "CERT-2024-001235",
          certificate_url: "/certificates/cert-2.pdf",
        },
        {
          id: "cert-3",
          course_id: "3",
          course_title: "Node.js Masterclass",
          instructor_name: "Jane Smith",
          completion_date: "2024-09-20",
          certificate_id: "CERT-2024-001236",
          certificate_url: "/certificates/cert-3.pdf",
        },
      ];

      setCertificates(mockCertificates);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setLoading(false);
    }
  };

  const handleDownload = (certificate) => {
    // TODO: Implement actual download
    console.log("Downloading certificate:", certificate.id);
    // window.open(certificate.certificate_url, '_blank');
  };

  const handleShare = (certificate) => {
    // TODO: Implement share functionality
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificate_id}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Certificate link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="mt-2 text-gray-600">
          {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Complete courses to earn certificates and showcase your achievements
          </p>
          <a
            href="/dashboard/student/my-courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View My Courses
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Certificate Preview */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white relative">
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-8 h-8 text-white opacity-80" />
                </div>
                <Award className="w-16 h-16 mb-4 opacity-90" />
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  Certificate of Completion
                </h3>
                <p className="text-sm opacity-90">
                  {certificate.course_title}
                </p>
              </div>

              {/* Certificate Details */}
              <div className="p-5">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Instructor</p>
                  <p className="font-semibold text-gray-900">
                    {certificate.instructor_name}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Completed On</p>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {formatDate(certificate.completion_date)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                  <p className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {certificate.certificate_id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(certificate)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => handleShare(certificate)}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <a
                  href={`/certificates/verify/${certificate.certificate_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Verify Certificate
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          About Your Certificates
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Certificates are automatically generated when you complete all course
              requirements
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Each certificate has a unique ID that can be verified by employers
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Share your certificates on LinkedIn, resume, or portfolio
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Download certificates as PDF for offline access
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
