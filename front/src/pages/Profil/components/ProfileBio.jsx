import React from "react";
import { Edit } from "lucide-react";

export default function ProfileBio({ displayUser }) {
  return (
    <div className="text-center max-w-md mb-4">
      <div className="flex items-center justify-center gap-2">
        <p className="text-gray-600 dark:text-gray-300">
          {displayUser.bio || ""}
        </p>
      </div>
    </div>
  );
}
