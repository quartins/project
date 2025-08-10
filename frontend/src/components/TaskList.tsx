import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "../css/TaskList.css";

type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  subjectId: number;
  createdAt: string;
};

type Subject = {
  id: number;
  name: string;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // state สำหรับแก้ไข task ทุกฟิลด์
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubjectId, setEditSubjectId] = useState<number | "">("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("pending");

  // state สำหรับ modal confirm ลบ task
  const [taskIdToDelete, setTaskIdToDelete] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resSubjects = await axios.get<Subject[]>("/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(resSubjects.data);

      const resTasks = await axios.get<Task[]>("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(resTasks.data);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tasksBySubjectId = tasks.reduce<Record<number, Task[]>>((acc, task) => {
    if (!acc[task.subjectId]) acc[task.subjectId] = [];
    acc[task.subjectId].push(task);
    return acc;
  }, {});

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditSubjectId(task.subjectId);
    setEditDueDate(task.dueDate);
    setEditStatus(task.status);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditSubjectId("");
    setEditDueDate("");
    setEditStatus("pending");
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) {
      alert("Title can't be empty");
      return;
    }
    if (editSubjectId === "") {
      alert("Please select a subject");
      return;
    }
    if (!editDueDate) {
      alert("Please select a due date");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/tasks/${id}`,
        {
          title: editTitle,
          description: editDescription,
          subjectId: editSubjectId,
          dueDate: editDueDate,
          status: editStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  // ฟังก์ชันเปิด modal confirm ลบ
  const confirmDeleteTask = (id: number) => {
    setTaskIdToDelete(id);
  };

  // ฟังก์ชันลบจริงเมื่อ confirm modal
  const deleteTask = async () => {
    if (taskIdToDelete === null) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tasks/${taskIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskIdToDelete(null); // ปิด modal
      fetchData();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  // ยกเลิกการลบ (ปิด modal)
  const cancelDelete = () => {
    setTaskIdToDelete(null);
  };

  if (loading) return <p>Loading...</p>;
  if (subjects.length === 0)
    return <p>No subjects found. Please add a subject first.</p>;

  return (
  <div className="tasklist-container">
    {subjects
      .filter((subject) => tasksBySubjectId[subject.id]?.length > 0)  // กรองเฉพาะวิชาที่มี task
      .map((subject) => (
        <section key={subject.id} className="subject-section">
          <h2 className="subject-title">{subject.name}</h2>

          <ul className="task-list">
            {tasksBySubjectId[subject.id].map((task) => (
              <li key={task.id} className="task-item">
                {/* แสดง task ปกติ */}
                <div className="task-content">
                  <div>
                    <div className="task-title">
                      <strong>Title:</strong> {task.title}
                    </div>
                    {task.description && (
                      <div className="task-description">
                        <strong>Description:</strong> {task.description}
                      </div>
                    )}
                    <div className="task-meta">
                      Due: {dayjs(task.dueDate).format("DD/MM/YYYY")} | Status: {task.status}
                    </div>
                  </div>
                  <div className="button-group icon-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => startEdit(task)}
                      title="Edit Task"
                    >
                      <img src="/edit.png" alt="Edit" className="icon" />
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => confirmDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      <img src="/delete.png" alt="Delete" className="icon" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Modal สำหรับแก้ไข Task */}
      {editingTaskId !== null && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h3>Edit Task</h3>

            <label className="input-label">
              Subject:
              <select
                className="input-field"
                value={editSubjectId}
                onChange={(e) => setEditSubjectId(Number(e.target.value))}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="input-label">
              Title:
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-field"
              />
            </label>

            <label className="input-label">
              Description:
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="input-field textarea-field"
              />
            </label>

            <label className="input-label">
              Due Date:
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="input-field"
              />
            </label>

            <label className="input-label">
              Status:
              <select
                className="input-field"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>

            <div className="button-group modal-buttons">
              <button className="btn btn-save" onClick={() => saveEdit(editingTaskId)}>
                Save
              </button>
              <button className="btn btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirm ลบ */}
      {taskIdToDelete !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to delete this task?</p>
            <div className="button-group">
              <button className="btn btn-delete" onClick={deleteTask}>
                Yes, Delete
              </button>
              <button className="btn btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
