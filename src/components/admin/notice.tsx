"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";

const NoticeContext = createContext<(message: string) => void>(() => {});

export function AdminNoticeProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<{ message: string } | null>(null);
  const notify = useCallback((message: string) => setNotice({ message }), []);
  return (
    <NoticeContext.Provider value={notify}>
      {children}
      <div className="admin-toast-region" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className="admin-toast admin-notice success">
            <span>{notice.message}</span>
            <button type="button" className="admin-icon-button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </NoticeContext.Provider>
  );
}

export function useAdminNotice() {
  return useContext(NoticeContext);
}
