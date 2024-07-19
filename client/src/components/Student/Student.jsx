import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import './Student.css';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import debounce from 'lodash/debounce'; // Import lodash debounce function

export const Student = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    firstname: '',
    lastname: '',
    grade: '',
  });
  const [grades, setGrades] = useState([]);
  const navigate = useNavigate();
  const localToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!localToken) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [localToken, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/student/all?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.status === 200) {
          const { data, totalPages } = response.data;
          setData(data);
          setFilteredData(data); // Initialize filtered data
          setTotalPages(totalPages);
          // Extract unique grades for the filter
          const uniqueGrades = [...new Set(data.map(item => item.grade))];
          setGrades(uniqueGrades);
        } else {
          setData([]);
          console.error('Failed to fetch data');
        }
      } catch (error) {
        setError('Error during data fetch');
        console.error('Error during data fetch:', error);
        localStorage.removeItem('authToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, navigate, localToken]);

  const applyFilters = useCallback(() => {
    const { firstname, lastname, grade } = filters;
    const newFilteredData = data.filter(item =>
      (firstname ? item.firstname.toLowerCase().includes(firstname.toLowerCase()) : true) &&
      (lastname ? item.lastname.toLowerCase().includes(lastname.toLowerCase()) : true) &&
      (grade ? item.grade === grade : true)
    );
    setFilteredData(newFilteredData);
    setTotalPages(Math.ceil(newFilteredData.length / itemsPerPage));
    setCurrentPage(1); // Reset to the first page
  }, [filters, data, itemsPerPage]);

  const debouncedApplyFilters = useCallback(debounce(() => {
    applyFilters();
  }, 300), [applyFilters]); // Debounce for 300ms

  useEffect(() => {
    debouncedApplyFilters();
  }, [filters, debouncedApplyFilters]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleEdit = (id) => {
    console.log(`Edit user with ID: ${id}`);
    // Implement your edit logic here, e.g., navigate to an edit page
  };

  const handleDelete = (id) => {
    console.log(`Delete user with ID: ${id}`);
    // Implement your delete logic here
  };

  const Table = ({ data, currentPage, totalPages }) => (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>
            First Name
            <input
              type="text"
              name="firstname"
              value={filters.firstname}
              onChange={handleFilterChange}
              placeholder="Filter by first name"
              className="filter-input"
            />
          </th>
          <th >
            Last Name
            <input
              type="text"
              name="lastname"
              value={filters.lastname}
              onChange={handleFilterChange}
              placeholder="Filter by last name"
              className="filter-input"
            />
          </th>
          <th className="filter-header">
            Grade
            <select
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Grades</option>
              {grades.map((grade, index) => (
                <option key={index} value={grade}>{grade}</option>
              ))}
            </select>
          </th>
          <th>Contact</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.firstname}</td>
            <td>{item.lastname}</td>
            <td>{item.grade}</td>
            <td>{item.contact}</td>
            <td>
              <button className="editBtn" onClick={() => handleEdit(item.id)}>Edit</button>
              <button className="deleteBtn" onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan="7" className='pagination'>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button >
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <button
                key={pageNumber + 1}
                onClick={() => handlePageChange(pageNumber + 1)}
                className={currentPage === pageNumber + 1 ? 'active' : ''}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div>
      <Header type={'dashboard'} action={"Logout"} />
      <Navbar />
      <SectionHeader section={'Student'} is_create={true} />
      <div className='main'>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <Table data={filteredData} currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};
