import React, { useState, useEffect } from 'react';
import {
  JobApplication,
  ApplicationStatus,
  getStatusLabel,
  formatDate,
  getStatusOptions
} from '../types/JobApplication';
import { JobApplicationService } from '../services/JobApplicationService';
import { Container, Row, Col, Table, Button, Form, Alert, Pagination, Spinner, Modal } from 'react-bootstrap';

interface JobApplicationTableProps {
  onEdit: (jobApplication: JobApplication) => void;
  resetFilter?: boolean; // Used to reset filter to "All Statuses"
  newApplication?: JobApplication; // New application to add to the list
  updatedApplication?: JobApplication; // Updated application to modify in the list
}

const JobApplicationTable: React.FC<JobApplicationTableProps> = ({
  onEdit,
  resetFilter,
  newApplication,
  updatedApplication
}) => {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [applicationToDelete, setApplicationToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pagination calculations
  const filteredApplications = jobApplications.filter(app => 
    statusFilter === '' || app.status === statusFilter
  );
  const totalPages = Math.ceil(filteredApplications.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  // Load job applications
  const loadJobApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const applications = await JobApplicationService.getAll();
      setJobApplications(applications);
    } catch (err: any) {
      setError(err.message || 'Failed to load job applications');
      console.error('Error loading job applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadJobApplications();
  }, []); // Only run once on mount

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: ApplicationStatus) => {
    try {
      await JobApplicationService.updateStatus(id, newStatus);
      
      setJobApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  // Handle delete - show confirmation modal
  const handleDelete = (app: JobApplication) => {
    setApplicationToDelete(app);
    setShowDeleteModal(true);
  };

  // Confirm delete - actually perform the deletion
  const confirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      setIsDeleting(true);
      await JobApplicationService.delete(applicationToDelete.id);
     
      setJobApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
      setShowDeleteModal(false);
      setApplicationToDelete(null);
    } catch (err: any) {
      setError(`Failed to delete application: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setApplicationToDelete(null);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Reset filter when resetFilter prop changes
  useEffect(() => {
    setStatusFilter('');
  }, [resetFilter]);

  // Add new application to the list when newApplication prop changes
  useEffect(() => {
    if (newApplication) {
      setJobApplications(prev => [newApplication, ...prev]); // Add to beginning of list
      // Note: Parent should reset newApplication to undefined after this
    }
  }, [newApplication]);

  // Update existing application when updatedApplication prop changes
  useEffect(() => {
    if (updatedApplication) {
      setJobApplications(prev => 
        prev.map(app => app.id === updatedApplication.id ? updatedApplication : app)
      );
      
    }
  }, [updatedApplication]);

  // Helper function to get status-specific Bootstrap classes
  const getStatusBadgeClass = (status: ApplicationStatus): string => {
    switch (status) {
      case 1: return 'text-primary'; // Applied
      case 2: return 'text-warning'; // Under Review
      case 3: return 'text-info'; // Interview
      case 4: return 'text-success'; // Offer
      case 5: return 'text-danger'; // Rejected
      case 6: return 'text-secondary'; // Withdrawn
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading job applications...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col md={6}>
          <h2 className="mb-0">Job Applications</h2>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center gap-3">
          <Form.Group className="d-flex align-items-center gap-2 mb-0">
            <Form.Label htmlFor="status-filter" className="mb-0 text-nowrap">Filter by Status:</Form.Label>
            <Form.Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === '' ? '' : parseInt(e.target.value) as ApplicationStatus)}
              size="sm"
              style={{ minWidth: '150px' }}
            >
              <option value="">All Statuses</option>
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-3 text-muted">
        Showing {currentApplications.length} of {filteredApplications.length} applications
        {statusFilter && ` (filtered by ${getStatusLabel(statusFilter)})`}
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-light">
            <tr>
              <th>Company Name</th>
              <th>Position</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentApplications.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4 fst-italic">
                  {statusFilter ? `No applications found with status "${getStatusLabel(statusFilter)}"` : 'No job applications found'}
                </td>
              </tr>
            ) : (
              currentApplications.map((app) => (
                <tr key={app.id}>
                  <td className="fw-medium">{app.company}</td>
                  <td>{app.position}</td>
                  <td>
                    <Form.Select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, parseInt(e.target.value) as ApplicationStatus)}
                      size="sm"
                      className={getStatusBadgeClass(app.status)}
                      style={{ maxWidth: '150px' }}
                    >
                      {getStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td className="text-muted">{formatDate(app.dateApplied)}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => onEdit(app)}
                      title="Edit Application"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(app)}
                      title="Delete Application"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination>
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applicationToDelete && (
            <div>
              <p className="mb-3">
                Are you sure you want to delete the job application for:
              </p>
              <div className="bg-light p-3 rounded mb-3">
                <strong>{applicationToDelete.company}</strong> - {applicationToDelete.position}
                <br />
                <small className="text-muted">
                  Applied on: {formatDate(applicationToDelete.dateApplied)}
                </small>
              </div>
              <p className="text-danger mb-0">
                <strong>This action cannot be undone.</strong>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              'Delete Application'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobApplicationTable;