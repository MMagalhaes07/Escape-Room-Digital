/**
 * Student List Page - Manage and view enrolled students
 */
import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  LoadingSpinner,
  EmptyState,
  Modal,
} from "@/components/ui";
import { useTeacher } from "@/hooks/useAPI";
import { Search, Eye, Edit, Trash } from "lucide-react";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { getStudentProfile } = useTeacher();

  useEffect(() => {
    // Mock data - In production, fetch from API
    setTimeout(() => {
      const mockStudents = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          grade: "9",
          points: 1250,
          scenariosCompleted: 2,
          status: "active",
        },
        {
          id: "2",
          name: "Bob Smith",
          email: "bob@example.com",
          grade: "9",
          points: 890,
          scenariosCompleted: 1,
          status: "active",
        },
        {
          id: "3",
          name: "Carol Davis",
          email: "carol@example.com",
          grade: "10",
          points: 2100,
          scenariosCompleted: 2,
          status: "active",
        },
      ];
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        s.email.toLowerCase().includes(value.toLowerCase()) ||
        s.grade.includes(value),
    );
    setFilteredStudents(filtered);
  };

  const handleViewDetails = async (student) => {
    try {
      const details = await getStudentProfile(student.id);
      setSelectedStudent({ ...student, ...details });
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Students</h1>
        <p className="text-[var(--text-secondary)]">
          {filteredStudents.length} enrolled students
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-[var(--text-secondary)]" />
          <Input
            placeholder="Search by name, email, or grade..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Students Found"
          description="Search didn't match any students"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--bg-tertiary)]">
                  <th className="text-left py-3 font-semibold text-[var(--text-secondary)]">
                    Name
                  </th>
                  <th className="text-left py-3 font-semibold text-[var(--text-secondary)]">
                    Email
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Grade
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Points
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Completed
                  </th>
                  <th className="text-right py-3 font-semibold text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="py-3">
                      <div className="font-medium">{student.name}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {student.email}
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded">
                        Grade {student.grade}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      <span className="font-bold text-[var(--accent-blue)]">
                        {student.points}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      {student.scenariosCompleted}/2
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="p-2 hover:bg-[var(--bg-secondary)] rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-[var(--bg-secondary)] rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedStudent?.name}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Email
                </div>
                <div className="font-medium">{selectedStudent.email}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Grade
                </div>
                <div className="font-medium">Grade {selectedStudent.grade}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Total Points
                </div>
                <div className="font-bold text-[var(--accent-blue)]">
                  {selectedStudent.points}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Status
                </div>
                <div className="font-medium capitalize">
                  {selectedStudent.status}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
              <h4 className="font-bold mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[var(--text-secondary)]">
                    Scenarios Completed
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedStudent.scenariosCompleted}/2
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)]">
                    Average Score
                  </div>
                  <div className="text-2xl font-bold">87%</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="primary" className="flex-1">
                Send Message
              </Button>
              <Button variant="secondary" className="flex-1">
                View Progress
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
