import { useState } from "react";
import axios from "axios";
import { createUser } from "../services/User.service";
import { useNavigate } from "react-router-dom";


function CreateUser() {

    const naviagte = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    siteName: "", // IT IS OPTIONAL FIELD, NOT REQUIRED

    applicationId: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createUser(formData);

      console.log("User created:", res.data);
      alert("User created successfully ✅");
      // after success move to user

      naviagte("/users")

      
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
        applicationId: "",
        siteName: ""
      });

    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Error creating user ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create User</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange} // this is input is required for creating user, without name it will throw error from backend
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

         <input
          type="text"
          name="siteName"
          placeholder="Site Name"
          value={formData.siteName}
          onChange={handleChange}
        />
``
        <input
          type="text"
          name="applicationId"
          placeholder="Application ID"
          value={formData.applicationId}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

export default CreateUser;