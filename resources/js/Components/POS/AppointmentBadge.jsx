import { IconCalendar, IconCheck } from "@tabler/icons-react";

export default function AppointmentBadge({ appointment, className = "" }) {
    if (!appointment) return null;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}
        >
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <IconCalendar className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 truncate">
                        {appointment.appointment_number}
                    </p>
                    {appointment.status === "completed" && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">
                            <IconCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                                Completed
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                    Appointment Transaction
                </p>
            </div>
        </div>
    );
}
