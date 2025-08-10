
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TodoApp from "./components/TodoApp";
import "./css/Navbar.css";

type Page = "login" | "signup" | "task";

function App() {
  const [page, setPage] = useState<Page>("login");

  // ฟังก์ชันเปลี่ยนหน้า พร้อมเปลี่ยน URL จริงด้วย history.pushState
  function navigate(newPage: Page) {
    setPage(newPage);
    window.history.pushState(null, "", "/" + newPage);
  }

  // ตอน mount component ตรวจสอบ token และ path URL เพื่อ set หน้าแรก
  useEffect(() => {
    const token = localStorage.getItem("token");

    // ฟังก์ชันอ่าน path จาก URL แล้วตั้งหน้า
    function setPageFromPath() {
      const path = window.location.pathname.replace("/", "") as Page;
      if (token && path === "task") {
        setPage("task");
      } else if (!token && (path === "login" || path === "signup")) {
        setPage(path);
      } else {
        setPage(token ? "task" : "login");
        window.history.replaceState(null, "", token ? "/task" : "/login");
      }
    }

    setPageFromPath();

    // ฟังเหตุการณ์ back/forward ของ browser
    window.addEventListener("popstate", () => {
      setPageFromPath();
    });
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("login");
  }

  return (
    <div className="container" style={{ paddingTop: "60px", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="/iconweb.png" alt="Logo" />
          <span className="navbar-title">Study Plan</span>
        </div>

        {page === "task" && (
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        )}
      </nav>

      {/* Main content */}
      <main style={{ padding: "1rem" }}>
        {page === "login" && (
          <Login
            goToSignup={() => navigate("signup")}
            onLogin={() => navigate("task")}
          />
        )}
        {page === "signup" && (
          <Signup
            goToLogin={() => navigate("login")}
            onSignup={() => navigate("task")}
          />
        )}
        {page === "task" && <TodoApp />}
      </main>
    </div>
  );
}

export default App;
