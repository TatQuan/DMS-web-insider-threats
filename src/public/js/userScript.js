const userForm = document.getElementById("user-form-card");
const mainForm = document.getElementById("user-main-form");
const formTitle = document.getElementById("form-title");
const btnSubmit = document.getElementById("btn-submit");
const passwordGroup = document.getElementById("password-group");

// Reset form to default state for creating new user
function openCreateForm() {
  formTitle.innerText = "Create New User";
  btnSubmit.innerText = "Create User";
  mainForm.method = "POST";
  mainForm.action = "/users/create";
  mainForm.reset();
  document.getElementById("user-id").value = "";
  passwordGroup.style.display = "block";
  userForm.style.display = "block";
}

// Open form with existing user data for editing
function openEditForm(userData) {
  formTitle.innerText = "Edit User: " + userData.FullName;
  btnSubmit.innerText = "Save Changes";
  mainForm.method = "POST";
  mainForm.action = "/users/update/" + userData.Id;
  mainForm.reset();

  // Populate form fields with user data
  document.getElementById("user-id").value = userData.Id;
  document.getElementById("f-name").value = userData.FullName;
  document.getElementById("f-email").value = userData.Email;
  document.getElementById("f-dept").value = userData.Department;
  document.getElementById("f-role").value = userData.Role;

  passwordGroup.style.display = "none"; // Hide password field when editing (to avoid accidental changes)
  userForm.style.display = "block";
}

function toggleUserForm() {
  if (userForm.style.display === "none" || userForm.style.display === "") {
    openCreateForm();
  } else {
    userForm.style.display = "none";
  }
}

// Close form when clicking on cancel or close buttons
document.querySelectorAll(".close-form, .btn-cancel").forEach((btn) => {
  btn.addEventListener("click", () => (userForm.style.display = "none"));
});

mainForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Chặn load lại trang

  // Get form data
  const formData = new FormData(mainForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(mainForm.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      // Show success message and reload page to update user list
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: result.message || "Data operation successful",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        location.reload(); // Reload page to reflect changes
      });
    } else {
      // Show error message from server (e.g., email already exists)
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: result.message || "Data operation failed",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire("Connection Error", "Unable to send data to the server", "error");
  }
});

async function deleteUser(userId, fullName) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `The account of "${fullName}" will be deleted permanently!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`/users/delete/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Deleted!", data.message, "success").then(() =>
          location.reload(),
        );
      } else {
        Swal.fire("Error!", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Unable to connect to the server", "error");
    }
  }
}
