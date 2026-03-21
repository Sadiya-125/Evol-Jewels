"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  MessageSquare,
  XCircle,
  FileText,
  Eye,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Heart,
  Hourglass,
  Save,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-800", icon: Clock },
  reviewed: {
    label: "Reviewed",
    color: "bg-yellow-100 text-yellow-800",
    icon: Eye,
  },
  in_discussion: {
    label: "In Discussion",
    color: "bg-purple-100 text-purple-800",
    icon: MessageSquare,
  },
  quoted: {
    label: "Quoted",
    color: "bg-indigo-100 text-indigo-800",
    icon: FileText,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const budgetLabels: Record<string, string> = {
  under_50k: "Under ₹50,000",
  "50k_1l": "₹50,000 - ₹1,00,000",
  "1l_3l": "₹1,00,000 - ₹3,00,000",
  "3l_5l": "₹3,00,000 - ₹5,00,000",
  above_5l: "Above ₹5,00,000",
};

const occasionLabels: Record<string, string> = {
  engagement: "Engagement",
  wedding: "Wedding",
  anniversary: "Anniversary",
  birthday: "Birthday",
  self: "Self",
  gift: "Gift",
  other: "Other",
};

export default function AdminCustomiseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inquiryId = params.id as string;

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: inquiry, isLoading } = trpc.customise.adminGetById.useQuery({
    id: inquiryId,
  });

  const updateStatus = trpc.customise.adminUpdateStatus.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: () => {
      setIsSaving(false);
      toast.error("Failed to update inquiry");
    },
  });

  useEffect(() => {
    if (inquiry) {
      setSelectedStatus(inquiry.status);
      setAdminNotes(inquiry.adminNotes || "");
    }
  }, [inquiry]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateStatus.mutateAsync({
      id: inquiryId,
      status: selectedStatus as any,
      adminNotes,
    });
  };

  const handleEmailReply = () => {
    if (inquiry) {
      const subject = `Re: Your Bespoke Inquiry (${inquiry.id})`;
      const body = `Dear ${inquiry.name},\n\nThank you for your bespoke inquiry.\n\n[Your message here]\n\nBest regards,\nEVOL Jewels Team`;
      window.location.href = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-pulse text-evol-metallic">
            Loading Inquiry Details...
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-evol-red" />
          <h3 className="font-serif text-2xl text-evol-dark-grey mb-2">
            Inquiry Not Found
          </h3>
          <Link
            href="/admin/customise"
            className="inline-flex items-center gap-2 text-evol-red hover:text-evol-dark-grey transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inquiries
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon =
    statusConfig[inquiry.status as keyof typeof statusConfig].icon;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/customise"
          className="inline-flex items-center gap-2 text-evol-metallic hover:text-evol-red transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Inquiries
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-4xl text-evol-dark-grey mb-2">
              Inquiry #{inquiry.id.slice(0, 8)}
            </h1>
            <p className="text-evol-metallic">
              Submitted on{" "}
              {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              statusConfig[inquiry.status as keyof typeof statusConfig].color,
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig[inquiry.status as keyof typeof statusConfig].label}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white border border-evol-grey p-6">
            <h2 className="font-serif text-2xl text-evol-dark-grey mb-4">
              Customer Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-evol-red/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-evol-red" />
                </div>
                <div>
                  <p className="text-xs text-evol-metallic uppercase tracking-wider mb-1">
                    Name
                  </p>
                  <p className="text-evol-dark-grey font-medium">
                    {inquiry.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-evol-red/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-evol-red" />
                </div>
                <div>
                  <p className="text-xs text-evol-metallic uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-evol-red hover:text-evol-dark-grey transition-colors"
                  >
                    {inquiry.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-evol-red/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-evol-red" />
                </div>
                <div>
                  <p className="text-xs text-evol-metallic uppercase tracking-wider mb-1">
                    Phone
                  </p>
                  <a
                    href={`tel:+91${inquiry.phone}`}
                    className="text-evol-red hover:text-evol-dark-grey transition-colors"
                  >
                    +91 {inquiry.phone}
                  </a>
                </div>
              </div>
              {inquiry.userId && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-evol-red/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-evol-red" />
                  </div>
                  <div>
                    <p className="text-xs text-evol-metallic uppercase tracking-wider mb-1">
                      Account Status
                    </p>
                    <p className="text-evol-dark-grey font-medium">
                      Registered User
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requirement Details */}
          <div className="bg-white border border-evol-grey p-6">
            <h2 className="font-serif text-2xl text-evol-dark-grey mb-4">
              Requirement Details
            </h2>
            <div className="space-y-4">
              {/* Budget */}
              {inquiry.budgetRange && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-evol-metallic" />
                    <p className="text-xs text-evol-metallic uppercase tracking-wider">
                      Budget Range
                    </p>
                  </div>
                  <p className="text-evol-dark-grey font-medium">
                    {budgetLabels[inquiry.budgetRange]}
                  </p>
                </div>
              )}

              {/* Occasion */}
              {inquiry.occasion && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-evol-metallic" />
                    <p className="text-xs text-evol-metallic uppercase tracking-wider">
                      Occasion
                    </p>
                  </div>
                  <p className="text-evol-dark-grey font-medium">
                    {occasionLabels[inquiry.occasion]}
                  </p>
                </div>
              )}

              {/* Timeline */}
              {inquiry.timeline && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hourglass className="w-4 h-4 text-evol-metallic" />
                    <p className="text-xs text-evol-metallic uppercase tracking-wider">
                      Timeline
                    </p>
                  </div>
                  <p className="text-evol-dark-grey font-medium">
                    {inquiry.timeline}
                  </p>
                </div>
              )}

              {/* Requirement Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-evol-metallic" />
                  <p className="text-xs text-evol-metallic uppercase tracking-wider">
                    Full Requirement
                  </p>
                </div>
                <div className="bg-evol-off-white border-l-4 border-evol-red p-4 mt-2">
                  <p className="text-evol-dark-grey leading-relaxed whitespace-pre-wrap">
                    {inquiry.requirement}
                  </p>
                </div>
              </div>

              {/* Reference Image */}
              {inquiry.referenceImageUrl && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4 text-evol-metallic" />
                    <p className="text-xs text-evol-metallic uppercase tracking-wider">
                      Reference Image
                    </p>
                  </div>
                  <div className="relative w-full h-96 border border-evol-grey mt-2">
                    <Image
                      src={inquiry.referenceImageUrl}
                      alt="Reference"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a
                    href={inquiry.referenceImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 text-sm text-evol-red hover:text-evol-dark-grey transition-colors"
                  >
                    Open in new tab
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-white border border-evol-grey p-6">
            <h3 className="font-semibold text-evol-dark-grey mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleEmailReply}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-evol-red text-white hover:bg-evol-dark-grey transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Customer
              </button>
              <a
                href={`tel:+91${inquiry.phone}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-evol-grey text-evol-dark-grey hover:bg-evol-off-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Customer
              </a>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white border border-evol-grey p-6">
            <h3 className="font-semibold text-evol-dark-grey mb-4">
              Update Status
            </h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-evol-grey px-4 py-3 mb-4 focus:outline-none focus:border-evol-red bg-white"
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <label className="block text-xs text-evol-metallic uppercase tracking-wider mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={6}
                placeholder="Add internal notes about this inquiry..."
                className="w-full border border-evol-grey px-4 py-3 focus:outline-none focus:border-evol-red resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 transition-colors",
                saveSuccess
                  ? "bg-green-600 text-white"
                  : "bg-evol-dark-grey text-white hover:bg-evol-red",
                isSaving && "opacity-50 cursor-not-allowed",
              )}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved Successfully
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </>
              )}
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-evol-grey p-6">
            <h3 className="font-semibold text-evol-dark-grey mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-evol-red/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-evol-red" />
                </div>
                <div>
                  <p className="text-sm font-medium text-evol-dark-grey">
                    Inquiry Submitted
                  </p>
                  <p className="text-xs text-evol-metallic">
                    {new Date(inquiry.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {inquiry.updatedAt && inquiry.updatedAt !== inquiry.createdAt && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-evol-red/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-evol-red" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-evol-dark-grey">
                      Last Updated
                    </p>
                    <p className="text-xs text-evol-metallic">
                      {new Date(inquiry.updatedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
