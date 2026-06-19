import { useState } from "react";
import MediaTile from "./MediaTile";
import QuickAddModal from "./QuickAddModal";
import { Plus } from "lucide-react";

export default function MediaGrid({ entries, refetch }) {
  const statuses = ["In Progress", "Planned", "Done"];
  const [openModalStatus, setOpenModalStatus] = useState(null);
  return (
    <div>
      {statuses.map((status) => {
        const items = entries.filter((e) => e.status === status);
        if (items.length === 0) return null;
        return (
          <div key={status} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-zinc-400 mb-2">{status}</p>
              <button
                onClick={() => setOpenModalStatus(status)}
                className="text-zinc-400 hover:text-white cursor-pointer mb-1.5"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {items.map((entry) => (
                <MediaTile key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        );
      })}

      {openModalStatus && (
        <QuickAddModal
          status={openModalStatus}
          onClose={() => setOpenModalStatus(null)}
          onAdded={refetch}
        />
      )}
    </div>
  );
}