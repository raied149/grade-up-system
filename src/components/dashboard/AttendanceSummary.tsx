
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AttendanceSummary as AttendanceSummaryType } from "@/lib/types";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface AttendanceSummaryProps {
  data: AttendanceSummaryType;
  title?: string;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ 
  data,
  title = "Today's Attendance" 
}) => {
  const { presentCount, absentCount, lateCount, excusedCount, total } = data;
  
  // Calculate percentages
  const presentPercentage = (presentCount / total) * 100;
  const absentPercentage = (absentCount / total) * 100;
  const latePercentage = (lateCount / total) * 100;
  const excusedPercentage = (excusedCount / total) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="mr-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Present</span>
                <span className="text-sm font-medium">{presentCount}/{total}</span>
              </div>
              <Progress value={presentPercentage} className="h-2 bg-gray-100" />
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Absent</span>
                <span className="text-sm font-medium">{absentCount}/{total}</span>
              </div>
              <Progress value={absentPercentage} className="h-2 bg-gray-100" />
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-4">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Late</span>
                <span className="text-sm font-medium">{lateCount}/{total}</span>
              </div>
              <Progress value={latePercentage} className="h-2 bg-gray-100" />
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-4">
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Excused</span>
                <span className="text-sm font-medium">{excusedCount}/{total}</span>
              </div>
              <Progress value={excusedPercentage} className="h-2 bg-gray-100" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceSummary;
