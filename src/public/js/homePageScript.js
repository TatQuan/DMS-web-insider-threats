const documentTable = document.getElementById("document-table");
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "/auth/login";
}

const loadDashboard = async () => {
  try {
    const res = await fetch("/api/documents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
      return;
    }

    const data = await res.json();

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((document) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${document.name}</td>
                    <td>${document.uploadedBy}</td>
                    <td>${new Date(document.uploadDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-primary" onclick="viewDocument('${document._id}')">View</button>
                        <button class="btn btn-danger" onclick="deleteDocument('${document._id}')">Delete</button>
                    </td>
                `;
        documentTable.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return { documents: [] };
  }
};

loadDashboard();
