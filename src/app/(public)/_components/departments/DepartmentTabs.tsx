"use client";

import { useState } from "react";
import { Building2, Folder, Clock, MapPin } from "lucide-react";
import { DepartmentData } from "../../departments/types";
import DepartmentInfo from "./DepartmentInfo";
import DepartmentResources from "./DepartmentResources";
import DepartmentActivity from "./DepartmentActivity";
import DepartmentAnnouncements from "./DepartmentAnnouncements";
import DepartmentContactCard from "./DepartmentContactCard";
import { Megaphone } from "lucide-react";

export default function DepartmentTabs({ data }: { data: DepartmentData }) {
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Department Info", icon: Building2 },
    { id: "resources", label: "Resources", icon: Folder },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "contact", label: "Contact", icon: MapPin },
  ];

  return (
    <div className="w-full bg-canvas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-8 border-b border-hairline pt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-2 text-[15px] font-semibold transition-all border-b-2 ${
                  isActive 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-steel hover:text-ink hover:border-gray-300"
                }`}
              >
                <Icon size={18} className={isActive ? "text-blue-500" : "text-steel"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="py-6 min-h-125">
          {activeTab === "info" && <DepartmentInfo data={data} />}
          {activeTab === "resources" && <DepartmentResources data={data} />}
          {activeTab === "activity" && <DepartmentActivity data={data} />}
          {activeTab === "announcements" && <DepartmentAnnouncements data={data} />}
          {activeTab === "contact" && <DepartmentContactCard data={data} />}
        </div>
      </div>
    </div>
  );
}
