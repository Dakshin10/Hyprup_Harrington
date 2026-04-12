"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { X, CheckCircle2 } from "lucide-react";

interface ApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  applicantUids: string[];
}

const ApplicantRow = ({
  uid,
  onSelect,
  onReject,
  isProcessing
}: {
  uid: string;
  onSelect: (uid: string) => void;
  onReject?: (uid: string) => void;
  isProcessing: boolean;
}) => {
  const [email, setEmail] = useState<string>("Loading user...");
  const [rating, setRating] = useState<number>(4.8);
  const [jobsCompleted, setJobsCompleted] = useState<number>(12);
  const [reliability, setReliability] = useState<number>(98);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists() && isMounted) {
          const d = userDoc.data();
          setEmail(d.email || "Unknown Student");
          if(d.rating) setRating(d.rating);
          if(d.jobsCompleted) setJobsCompleted(d.jobsCompleted);
          if(d.reliability) setReliability(d.reliability);
        }
      } catch (e) {
        if (isMounted) setEmail("Failed to load user");
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [uid]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-brand-border bg-brand-panel hover:border-secondary transition-all gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-teal-50 text-secondary shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-sm font-bold text-brand-text-primary">{email}</span>
             {rating >= 4.5 && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded border border-amber-100">Top Match</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-brand-text-secondary font-medium">
             <span className="flex items-center gap-1"><span className="text-amber-400">★</span> {rating}</span>
             <span>•</span>
             <span>{jobsCompleted} Jobs</span>
             <span>•</span>
             <span className="text-emerald-600">{reliability}% Reliable</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {onReject && (
          <Button
            variant="danger"
            isLoading={isProcessing}
            disabled={isProcessing}
            onClick={() => onReject(uid)}
            className="flex-1 sm:flex-none"
          >
            Reject
          </Button>
        )}
        <Button
          variant="secondary"
          isLoading={isProcessing}
          disabled={isProcessing}
          onClick={() => onSelect(uid)}
          className="flex-1 sm:flex-none px-6"
        >
          Select
        </Button>
      </div>
    </div>
  );
};

export const ApplicantsModal = ({ isOpen, onClose, jobId, applicantUids }: ApplicantsModalProps) => {
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  const handleSelect = async (uid: string) => {
    if (!jobId) return;
    setProcessingUid(uid);
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        selectedUser: uid,
        status: "assigned"
      });
      onClose(); // Close modal immediately after success
    } catch (error) {
      console.error("Failed to assign:", error);
      alert("Failed to assign job. Please try again.");
    } finally {
      setProcessingUid(null);
    }
  };

  const handleReject = async (uid: string) => {
    if (!jobId) return;
    setProcessingUid(uid);
    try {
      const jobRef = doc(db, "jobs", jobId);
      // Rejects actively push the UID out of the applicants payload 
      await updateDoc(jobRef, {
        applicants: applicantUids.filter(u => u !== uid)
      });
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setProcessingUid(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Review Applicants
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {applicantUids.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No applicants yet. Sit tight!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applicantUids.map((uid) => (
                    <ApplicantRow
                      key={uid}
                      uid={uid}
                      onSelect={handleSelect}
                      onReject={handleReject}
                      isProcessing={processingUid === uid}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
