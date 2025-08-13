"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Student {
  id: string;
  name: string;
  surname: string;
  email?: string;
  class: {
    name: string;
    grade: {
      level: number;
    };
  };
}

interface PaymentFormProps {
  type: "create" | "update" | "delete";
  data?: any;
  onClose?: () => void;
}

const PaymentForm = ({ type, data, onClose }: PaymentFormProps) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: data?.studentId || "",
    amount: data?.amount || "",
    paymentType: data?.paymentType || "TUITION",
    paymentMethod: data?.paymentMethod || "CASH",
    dueDate: data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : "",
    description: data?.description || "",
    status: data?.status || "PENDING"
  });

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        if (response.ok) {
          const data = await response.json();
          console.log('Students API response:', data);
          setStudents(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch students:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  // Set selected student when updating
  useEffect(() => {
    if (data?.studentId && students.length > 0) {
      const student = students.find(s => s.id === data.studentId);
      if (student) {
        setSelectedStudent(student);
        setSearchTerm(`${student.name} ${student.surname}`);
      }
    }
  }, [data?.studentId, students]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredStudents = students.filter(student =>
    `${student.name} ${student.surname} ${student.email || ''} ${student.class?.name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  console.log('Students:', students.length);
  console.log('Search term:', searchTerm);
  console.log('Filtered students:', filteredStudents.length);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setFormData({ ...formData, studentId: student.id });
    setSearchTerm(`${student.name} ${student.surname}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      toast.error("Please select a student");
      return;
    }
    
    setLoading(true);

    try {
      const url = type === "create" ? "/api/payments" : `/api/payments/${data.id}`;
      const method = type === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          type === "create" ? "Payment created successfully!" : "Payment updated successfully!"
        );
        router.refresh();
        onClose?.();
      } else {
        const error = await response.json();
        toast.error(error.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/payments/${data.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Payment deleted successfully!");
        router.refresh();
        onClose?.();
      } else {
        const error = await response.json();
        toast.error(error.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {type === "create" ? "Create Payment" : "Update Payment"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a student by name, email, or class..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setSelectedStudent(null);
                    setFormData({ ...formData, studentId: "" });
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              {showDropdown && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      >
                        <div className="font-medium">
                          {student.name} {student.surname}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.email && `${student.email} • `}
                          {student.class?.name ? `Class ${student.class.name}` : 'No class assigned'}
                          {student.class?.grade?.level && ` (Grade ${student.class.grade.level})`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">No students found</div>
                  )}
                </div>
              )}
            </div>
            
            {selectedStudent && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-medium text-green-900">
                  ✓ Selected: {selectedStudent.name} {selectedStudent.surname}
                </div>
                <div className="text-xs text-green-700">
                  Class: {selectedStudent.class?.name || 'No class assigned'}
                  {selectedStudent.class?.grade?.level && ` (Grade ${selectedStudent.class.grade.level})`}
                </div>
              
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type *
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="TUITION">Tuition Fee</option>
              <option value="EXAM">Exam Fee</option>
              <option value="TRANSPORT">Transport Fee</option>
              <option value="LIBRARY">Library Fee</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="ONLINE">Online Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional description for this payment..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading || !selectedStudent}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : type === "create" ? "Create Payment" : "Update Payment"}
            </button>
            
            {type === "update" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
