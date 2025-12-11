import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateCertificate,
  checkCertificateExists,
} from "@/lib/apiCalls/certificates/certificate.service";


export default function CertificateButton({
  courseId,
  completionPercentage,
  className = "",
}) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [certificate, setCertificate] = useState(null);

  
  useEffect(() => {
    const checkCertificate = async () => {
      if (completionPercentage !== 100 || !courseId) {
        setIsChecking(false);
        return;
      }

      try {
        const checkResponse = await checkCertificateExists(courseId);
        if (checkResponse.success && checkResponse.exists) {
          setCertificate(checkResponse.data);
        }
      } catch (error) {
        console.error("Error checking certificate:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCertificate();
  }, [courseId, completionPercentage]);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    try {
      const response = await generateCertificate(courseId);
      if (response.success) {
        toast.success("Certificate generated successfully!");
        setCertificate(response.data);
        router.push(`/certificates/${response.data.id}`);
      } else {
        toast.error(response.message || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("An error occurred while generating the certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  
  if (completionPercentage !== 100) {
    return null;
  }

  
  if (isChecking) {
    return (
      <span className={`inline-flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </span>
    );
  }

  
  if (certificate?.id) {
    return (
      <Link
        href={`/certificates/${certificate.id}`}
        className={`inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors ${className}`}
      >
        <Award className="h-4 w-4" />
        View Certificate
      </Link>
    );
  }

  
  return (
    <Button
      onClick={handleGenerateCertificate}
      disabled={isGenerating}
      size="sm"
      className={`gap-2 ${className}`}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Award className="h-4 w-4" />
      )}
      {isGenerating ? "Generating..." : "Get My Certificate"}
    </Button>
  );
}
