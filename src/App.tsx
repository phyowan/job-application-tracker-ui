import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobApplicationTable from './components/JobApplicationTable';
import JobApplicationForm from './components/JobApplicationForm';
import { JobApplication } from './types/JobApplication';
import { Container, Navbar, Button, Row, Col } from 'react-bootstrap';
import './App.css';

const App: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>(undefined);
  const [resetFilter, setResetFilter] = useState<boolean>(false);
  const [newApplication, setNewApplication] = useState<JobApplication | undefined>(undefined);
  const [updatedApplication, setUpdatedApplication] = useState<JobApplication | undefined>(undefined);


  useEffect(() => {
    if (newApplication) {
      const timer = setTimeout(() => {
        setNewApplication(undefined);
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [newApplication]);

  
  useEffect(() => {
    if (updatedApplication) {
      const timer = setTimeout(() => {
        setUpdatedApplication(undefined);
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [updatedApplication]);

  // Handle opening form for new application
  const handleAddNew = () => {
    setEditingApplication(undefined);
    setIsFormVisible(true);
  };

  // Handle opening form for editing
  const handleEdit = (jobApplication: JobApplication) => {
    setEditingApplication(jobApplication);
    setIsFormVisible(true);
  };

  // Handle form success (create or update)
  const handleFormSuccess = (jobApplication: JobApplication) => {
    setIsFormVisible(false);
    setEditingApplication(undefined);
    
    // For new applications
    if (!editingApplication) {
      setNewApplication(jobApplication); // Pass new app to table
      setResetFilter(prev => !prev); // Reset filter to show the new application
    } else {
      
      setUpdatedApplication(jobApplication);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingApplication(undefined);
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar bg="dark" variant="dark" className="px-3">
          <Navbar.Brand href="#home">
            <h4 className="mb-0">Job Application Tracker</h4>
          </Navbar.Brand>
          <Navbar.Text>
            Manage and track your job applications efficiently
          </Navbar.Text>
        </Navbar>

        <main className="flex-grow-1">
          <Routes>
            <Route 
              path="/" 
              element={
                <Container fluid className="py-4">
                  <Row className="mb-4">
                    <Col md={6}>
                      <h2>Dashboard</h2>
                    </Col>
                    <Col md={6} className="d-flex justify-content-end">
                      <Button 
                        variant="primary"
                        onClick={handleAddNew}
                        size="lg"
                      >
                        + Add New Application
                      </Button>
                    </Col>
                  </Row>
                  
                  <JobApplicationTable
                    onEdit={handleEdit}
                    resetFilter={resetFilter}
                    newApplication={newApplication}
                    updatedApplication={updatedApplication}
                  />
                </Container>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <JobApplicationForm
          jobApplication={editingApplication}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          isVisible={isFormVisible}
        />

        <footer className="bg-light text-center py-3 mt-auto">
          <Container>
            <p className="mb-0 text-muted">&copy; 2024 Job Application Tracker. Built with React & TypeScript.</p>
          </Container>
        </footer>
      </div>
    </Router>
  );
};

export default App;
