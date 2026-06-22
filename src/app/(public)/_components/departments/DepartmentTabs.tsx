"use client";

import { useState } from "react";
import { Building2, Folder, Clock, MapPin } from "lucide-react";
import { DepartmentData } from "../../../departments/types";
import DepartmentInfo from "./DepartmentInfo";
import DepartmentResources from "./DepartmentResources";
import DepartmentActivity from "./DepartmentActivity";
import DepartmentContactCard from "./DepartmentContactCard";

export default function DepartmentTabs({ data }: { data: DepartmentData }) {
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Department Info", icon: Building2 },
    { id: "resources", label: "Resources", icon: Folder },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "contact", label: "Contact", icon: MapPin },
  ];

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-8 border-b border-gray-100 pt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive 
                    ? "border-green-600 text-gray-900" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={18} className={isActive ? "text-gray-900" : "text-gray-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="py-6 min-h-[500px]">
          {activeTab === "info" && <DepartmentInfo data={data} />}
          {activeTab === "resources" && <DepartmentResources data={data} />}
          {activeTab === "activity" && <DepartmentActivity data={data} />}
          {activeTab === "contact" && <DepartmentContactCard data={data} />}
        </div>
      </div>
    </div>
  );
}
