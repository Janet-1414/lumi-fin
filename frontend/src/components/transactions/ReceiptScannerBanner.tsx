"use client";
import { useState, useRef } from "react";
import { Camera, X, Upload, Loader, MessageSquare } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ScanResult {
  amount?: number;
  type?: string;
  category?: string;
  description?: string;
  merchant?: string;
  error?: string;
}

interface ReceiptScannerBannerProps {
  onScanned?: (result: ScanResult) => void;
}

export default function ReceiptScannerBanner({ onScanned }: ReceiptScannerBannerProps) {
  const user = useUser();
  const isPro = user?.subscription_tier === "pro";
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"receipt" | "sms">("receipt");
  const [isScanning, setIsScanning] = useState(false);
  const [smsText, setSmsText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await api.post<ScanResult>("/transactions/scan/receipt", {
          image_base64: base64,
          image_type: file.type,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Receipt scanned! Review and confirm.");
          onScanned?.(result);
          setIsOpen(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast.error(e.message || "Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSmsScan = async () => {
    if (!smsText.trim()) {
      toast.error("Please paste your Mobile Money SMS first");
      return;
    }
    setIsScanning(true);
    try {
      const result = await api.post<ScanResult>("/transactions/scan/sms", {
        sms_text: smsText.trim(),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("SMS parsed! Review and confirm.");
        onScanned?.(result);
        setIsOpen(false);
        setSmsText("");
      }
    } catch (e: any) {
      toast.error(e.message || "Could not parse SMS.");
    } finally {
      setIsScanning(false);
    }
  };

  if (!isPro) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-card bg-[var(--bg-card)] border border-[var(--border)] mb-5">
        <div className="w-10 h-10 rounded-card bg-mg-gold/10 flex items-center justify-center flex-shrink-0">
          <Camera size={20} className="text-[var(--text-muted)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">AI Receipt & SMS Scanner — Pro</p>
          <p className="text-xs text-[var(--text-muted)]">
            Upload a receipt or paste your MTN/Airtel SMS to auto-log transactions
          </p>
        </div>
        <Link
          href="/subscription"
          className="text-xs font-semibold text-mg-gold border border-mg-gold/40 px-3 py-1.5 rounded-card hover:bg-mg-gold/20 transition-all flex-shrink-0"
        >
          Unlock
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 p-4 rounded-card bg-[var(--bg-card)] border border-[var(--border)] hover:border-mg-gold/40 hover:bg-mg-gold/5 transition-all mb-5 text-left"
      >
        <div className="w-10 h-10 rounded-card bg-mg-gold/10 flex items-center justify-center flex-shrink-0">
          <Camera size={20} className="text-mg-gold" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Scan Receipt or Mobile Money SMS</p>
          <p className="text-xs text-[var(--text-muted)]">
            AI reads your receipt or MTN/Airtel message and logs the transaction automatically
          </p>
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setSmsText(""); }} title="AI Scanner">
        <div className="flex gap-1 p-1 rounded-card bg-[var(--bg-secondary)] mb-4">
          <button
            onClick={() => setTab("receipt")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-card text-sm font-medium transition-all ${
              tab === "receipt" ? "bg-[var(--bg-card)] text-mg-gold shadow-sm" : "text-[var(--text-muted)]"
            }`}
          >
            <Camera size={15} /> Receipt
          </button>
          <button
            onClick={() => setTab("sms")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-card text-sm font-medium transition-all ${
              tab === "sms" ? "bg-[var(--bg-card)] text-mg-gold shadow-sm" : "text-[var(--text-muted)]"
            }`}
          >
            <MessageSquare size={15} /> Mobile Money SMS
          </button>
        </div>

        {tab === "receipt" && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              Upload a photo of your receipt, bill, or any payment confirmation. Lumi AI will extract the amount, merchant, and category automatically.
            </p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isScanning}
              className="w-full flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-mg-gold/30 rounded-card text-[var(--text-muted)] hover:border-mg-gold/60 hover:text-mg-gold transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <><Loader size={24} className="animate-spin text-mg-gold" /><span className="text-sm">Scanning with AI...</span></>
              ) : (
                <><Upload size={24} /><span className="text-sm font-medium">Click to upload image</span><span className="text-xs">JPG, PNG, WEBP supported</span></>
              )}
            </button>
          </div>
        )}

        {tab === "sms" && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              Copy your MTN Mobile Money, Airtel Money, or M-PESA confirmation SMS and paste it below.
            </p>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="e.g. You have received UGX 50,000 from 0772123456. Your balance is UGX 150,000. Ref: ABC123"
              rows={5}
              className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-3 py-2.5 text-sm focus:outline-none focus:border-mg-gold resize-none"
            />
            <button
              onClick={handleSmsScan}
              disabled={isScanning || !smsText.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-card bg-mg-gold text-mg-bg font-semibold text-sm hover:bg-yellow-400 disabled:opacity-50 transition-all"
            >
              {isScanning ? <><Loader size={16} className="animate-spin" /> Parsing...</> : "Parse SMS with AI"}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
