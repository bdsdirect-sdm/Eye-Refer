/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./AddStaff.css";

const AddStaff: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [staffList, setStaffList] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]); // For filtered staff
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const staffPerPage = 5; // Number of staff to display per page

  // Fetch staff list on component mount
  useEffect(() => {
    const fetchStaff = async () => {
      setFetching(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view staff.");
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(import.meta.env.VITE_GET_STAFF, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setStaffList(response.data);
          setFilteredStaff(response.data); // Initialize filtered staff with all staff
        } else {
          toast.error("Failed to fetch staff list.");
        }
      } catch (err: any) {
        toast.error("Error fetching staff list");
        console.log(err);
      } finally {
        setFetching(false);
      }
    };

    fetchStaff();
  }, [navigate]);

  // Handle adding new staff
  const handleAddStaff = async (values: any, { resetForm }: any) => {
    const { staffName, email, phone, gender } = values;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add staff.");
      navigate("/login");
      return;
    }

    const staffData = {
      staffName,
      email,
      phone,
      gender,
    };

    try {
      setLoading(true);
      const response = await api.post("/add-Staff", staffData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success("Staff added successfully");

        // Add the new staff to the staff list directly without re-fetching
        const newStaff = { ...staffData, id: response.data.id }; // Assuming the response contains the new staff data including the id
        setStaffList((prevStaff) => [...prevStaff, newStaff]);
        setFilteredStaff((prevStaff) => [...prevStaff, newStaff]);

        resetForm(); // Reset the form after submission
        closeModal();
      } else {
        toast.error("Failed to add staff");
      }
    } catch (err: any) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Check if the search query looks like an email (contains "@")
      const isEmailSearch = searchQuery.includes("@");

      if (isEmailSearch) {
        // If it's an email, filter by the email field
        setFilteredStaff(
          staffList.filter((staff: any) =>
            staff.email.toLowerCase().includes(searchQuery.toLowerCase()) // Check if email includes the search query
          )
        );
      } else {
        // Otherwise, perform the normal search (by staff name or phone)
        const isPhoneSearch = /^[0-9]+$/.test(searchQuery);

        if (isPhoneSearch) {
          // If it's a phone number, filter by the phone field
          setFilteredStaff(
            staffList.filter(
              (staff: any) => staff.phone.includes(searchQuery) // Check if phone number includes the search query
            )
          );
        } else {
          // Otherwise, perform the normal search (by staff name)
          setFilteredStaff(
            staffList.filter((staff: any) =>
              `${staff.staffName}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
          );
        }
      }
    } else {
      // If search input is empty, reset to show all staff
      setFilteredStaff(staffList);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);
  const indexOfLastStaff = currentPage * staffPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstStaff, indexOfLastStaff);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    staffName: Yup.string().required("Staff Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must be numeric") // Ensure phone number is numeric
      .required("Phone Number is required"),
    gender: Yup.string().required("Gender is required"),
  });

  return (
    <>
      <div className="add-staff-container">
        <div className="add-staff">
          <h5 className="appointments-list-title">Staff List</h5>
          <button className="btn-add-staff" onClick={openModal}>
            + Add Staff
          </button>
        </div>

        {/* Modal for adding new staff */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add Staff</h3>

              <Formik
                initialValues={{
                  staffName: "",
                  email: "",
                  phone: "",
                  gender: "Male",
                }}
                validationSchema={validationSchema}
                onSubmit={handleAddStaff}
              >
                {({ isSubmitting }) => (
                  <Form className="add-staff-form">
                    <div className="form-group1">
                      <label htmlFor="staffName">
                        Staff Name<span className="star">*</span>
                      </label>
                      <Field
                        type="text"
                        id="staffName"
                        className="form-control1"
                        name="staffName"
                      />
                      <ErrorMessage
                        name="staffName"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group1">
                      <label htmlFor="email">
                        Email<span className="star">*</span>
                      </label>
                      <Field
                        type="email"
                        id="email"
                        className="form-control1"
                        name="email"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group1">
                      <label htmlFor="phone">
                        Phone Number<span className="star">*</span>
                      </label>
                      <Field
                        type="text"
                        id="phone"
                        className="form-control1"
                        name="phone"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group1">
                      <label htmlFor="gender">
                        Gender<span className="star">*</span>
                      </label>
                      <Field
                        as="select"
                        id="gender"
                        className="form-control"
                        name="gender"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Field>
                      <ErrorMessage
                        name="gender"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="add-staff-div">
                      <button
                        className="btn btn-cancel1"
                        type="button"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || loading}
                      >
                        {loading ? "Adding Staff..." : "Add Staff"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {/* Search Input */}
        <form
          className="d-flex mb-4 hii1"
          style={{ marginTop: 25 }}
          role="search"
          onSubmit={(e) => e.preventDefault()} // Prevent form submission on Enter key press
        >
          <input
            className="form-control me-2 hi2"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value); // Update search query as user types
              handleSearch(); // Trigger search as soon as the input changes
            }}
            aria-label="Search"
          />
          <button
            className="btn btn-primary btn-search"
            type="button"
            onClick={handleSearch} // Trigger search when Search button is clicked
          >
            <i className="fa fa-search" style={{ marginRight: 5 }}></i>Search
          </button>
        </form>

        {/* Staff List Table */}
        {fetching ? (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : currentStaff.length > 0 ? (
          <div className="staff-list-container">
            <div className="patient-table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Staff Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStaff.map((staff: any, index: number) => (
                    <tr key={staff.id}>
                      <td>{staff.staffName}</td>
                      <td>{staff.email}</td>
                      <td>{staff.phone}</td>
                      <td>{staff.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>No staff found.</p>
        )}

        {/* Pagination Controls */}
        <div className="pagination-controls d-flex justify-content-end mt-4 pagination-color">
          <nav aria-label="Page navigation example">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <a
                  className="page-link"
                  href="#"
                  aria-label="Previous"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              {/* Loop to create page numbers */}
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </a>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <a
                  className="page-link"
                  href="#"
                  aria-label="Next"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default AddStaff;
