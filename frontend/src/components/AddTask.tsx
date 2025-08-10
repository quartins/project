
import { useEffect, useState } from "react";
import axios from "axios";
import "../css/AddTask.css";

type Subject = {
  id: number;
  name: string;
};

type Props = {
  onAdded: () => void;
  onCancel?: () => void;  // เพิ่ม prop นี้สำหรับยกเลิก
  refreshTrigger?: boolean;
};

export default function AddTask({ onAdded, onCancel, refreshTrigger }: Props) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] = useState("pending");
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get<Subject[]>("/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(res.data);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };

    fetchSubjects();
  }, [refreshTrigger]);

  const handleAddTask = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      await axios.post(
        "/api/tasks",
        {
          title,
          subjectId: Number(subjectId),
          description,
          dueDate,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setSubjectId("");
      setDueDate("");
      setStatus("pending");

      onAdded();
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  return (
    <div className="add-task-card">
      <h3 className="add-task-title"> Add New Task</h3>

      <select
        className="input-field"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
      >
        <option value="">-- Select Subject --</option>
        {subjects.map((subj) => (
          <option key={subj.id} value={subj.id}>
            {subj.name}
          </option>
        ))}
      </select>

      <input
        className="input-field"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="input-field"
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <div className="input-wrapper">
      <label htmlFor="dueDate" className="floating-label">Deadline</label>

        <input
          className="input-field"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          id="dueDate"
        />
      </div>

      <select
        className="input-field"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>

      </select>

      <div className="button-group">
        <button className="submit-button" onClick={handleAddTask}>
          Add Task
        </button>
        {onCancel && (
          <button className="cancel-button1" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
